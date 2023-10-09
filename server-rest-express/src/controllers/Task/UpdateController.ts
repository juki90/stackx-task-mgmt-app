import { Op } from 'sequelize';
import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpPut,
    response,
    controller
} from 'inversify-express-utils';

import { en as messages } from '@/locales';
import { TASK_UPDATABLE_FIELDS } from '@/models/Task';

import type { Request, Response } from 'express';
import type {
    Task,
    Sequelize,
    ITaskRepository,
    TaskUsersStatus,
    IUserRepository,
    ITaskUpdateController
} from '@/types';

@controller('/tasks')
export class TaskUpdateController implements ITaskUpdateController {
    constructor(
        @inject('services.sequelize')
        public sequelize: Sequelize,

        @inject('repositories.task')
        public taskRepository: ITaskRepository,

        @inject('repositories.user')
        public userRepository: IUserRepository
    ) {}

    @httpPut('/:id')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<
        Response<
            Task | { message: string; field: string; data: string[] }[] | string
        >
    > {
        const {
            loggedUser,
            params: { id },
            body: taskPayload
        } = req;

        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        const { usersStatus: existingTaskUsersStatus } = existingTask;

        taskPayload.userIds = Array.from(new Set(taskPayload.userIds));

        const { userIds: taskPayloadUserIds } = taskPayload;

        const isTaskPayloadAndExistingTaskUserIdsSame =
            existingTaskUsersStatus.length === taskPayloadUserIds.length &&
            existingTaskUsersStatus.every(({ userId }: { userId: string }) =>
                taskPayloadUserIds.includes(userId)
            );

        let newOrSameTaskUsersStatus: TaskUsersStatus = existingTaskUsersStatus;

        if (!isTaskPayloadAndExistingTaskUserIdsSame) {
            newOrSameTaskUsersStatus = [];

            taskPayloadUserIds.forEach((userId: string) => {
                const existingTaskUsersStatusItem =
                    existingTaskUsersStatus.find(
                        ({ userId: existingUserId }) =>
                            userId === existingUserId
                    );

                if (existingTaskUsersStatusItem) {
                    newOrSameTaskUsersStatus.push(existingTaskUsersStatusItem);

                    return;
                }

                newOrSameTaskUsersStatus.push({ userId });
            });
        }

        const newOrSameUserIds = newOrSameTaskUsersStatus.map(
            ({ userId }) => userId
        );
        const users = await this.userRepository.findAll({
            where: { id: { [Op.in]: newOrSameUserIds } }
        });

        if (users.length !== taskPayloadUserIds.length) {
            const userIds = users.map(({ id }) => id);
            const missingUserIds = taskPayloadUserIds.filter(
                (userId: string) => !userIds.includes(userId)
            );

            return res.status(StatusCodes.BAD_REQUEST).send([
                {
                    message:
                        messages.validators.tasks.notAllUsersFromArrayExist,
                    field: 'general',
                    data: missingUserIds
                }
            ]);
        }

        const t = await this.sequelize.transaction();

        try {
            await Promise.all([
                existingTask.removeUsers(),
                existingTask.setUpdatedBy(loggedUser)
            ]);

            await existingTask.setUsers(users);

            const taskToSend = await existingTask.update(
                { ...taskPayload, usersStatus: newOrSameTaskUsersStatus },
                { fields: TASK_UPDATABLE_FIELDS }
            );

            return res.json(taskToSend);
        } catch (error) {
            await t.rollback();

            throw error;
        }
    }
}

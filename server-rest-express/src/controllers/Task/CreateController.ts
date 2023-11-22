import { Op } from 'sequelize';
import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpPost,
    response,
    controller
} from 'inversify-express-utils';

import { en as messages } from '@/locales';

import type { Request, Response } from 'express';
import type {
    Task,
    Sequelize,
    ITaskRepository,
    TaskUsersStatus,
    IUserRepository,
    ITaskCreateController
} from '@/types';

@controller('/tasks')
export class TaskCreateController implements ITaskCreateController {
    constructor(
        @inject('services.sequelize')
        public sequelize: Sequelize,

        @inject('repositories.task')
        public taskRepository: ITaskRepository,

        @inject('repositories.user')
        public userRepository: IUserRepository
    ) {}

    @httpPost('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<
        Response<
            | Task
            | { message: string; field: string; data?: string[] }[]
            | string
        >
    > {
        const { loggedUser, body: taskPayload } = req;

        taskPayload.userIds = Array.from(new Set(taskPayload.userIds));

        const { userIds: taskPayloadUserIds } = taskPayload;
        const usersStatus: TaskUsersStatus = taskPayloadUserIds.map(
            (userId: string) => ({
                userId
            })
        );
        const users = await this.userRepository.findAll({
            where: {
                id: {
                    [Op.in]: taskPayloadUserIds
                },
                deletedAt: { [Op.eq]: null }
            }
        });

        if (users.length !== taskPayloadUserIds.length) {
            const userIds = users.map(({ id }) => id);
            const missingUserIds = taskPayloadUserIds.filter(
                (userId: string) => !userIds.includes(userId)
            );

            return res.status(StatusCodes.BAD_REQUEST).send({
                errors: [
                    {
                        message:
                            messages.validators.tasks.notAllUsersFromArrayExist,
                        field: 'general',
                        data: missingUserIds
                    }
                ]
            });
        }

        const t = await this.sequelize.transaction();

        try {
            const createdTask = await this.taskRepository.create({
                ...taskPayload,
                status: 0,
                usersStatus
            });

            await Promise.all([
                createdTask.setCreatedBy(loggedUser),
                createdTask.setUsers(users)
            ]);

            return res.status(StatusCodes.CREATED).json(createdTask);
        } catch (error) {
            await t.rollback();

            throw error;
        }
    }
}

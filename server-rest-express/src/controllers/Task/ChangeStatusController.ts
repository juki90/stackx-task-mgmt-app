import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpGet,
    response,
    controller
} from 'inversify-express-utils';

import { en as messages } from '@/locales';
import { TASK_STATUSES } from '@/models/Task';

import type { Request, Response } from 'express';
import type {
    Sequelize,
    ITaskRepository,
    ITaskChangeStatusController
} from '@/types';

@controller('/tasks')
export class TaskChangeStatusController implements ITaskChangeStatusController {
    constructor(
        @inject('services.sequelize')
        public sequelize: Sequelize,

        @inject('repositories.task')
        public taskRepository: ITaskRepository
    ) {}

    @httpGet('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<string>> {
        const {
            loggedUser,
            params: { id },
            body: { status }
        } = req;

        const task = await this.taskRepository.findById(id);

        if (!task) {
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        const { status: taskStatus, usersStatus } = task;

        if (
            taskStatus === TASK_STATUSES.PENDING &&
            status === TASK_STATUSES.DONE
        ) {
            const userIndex = usersStatus.findIndex(
                ({ userId }) => userId === loggedUser.id
            );

            if (userIndex < 0) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .send(messages.validators.tasks.youDontBelongToThisTask);
            }

            if (usersStatus[userIndex].doneAt) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .send(messages.validators.tasks.alreadyDone);
            }

            task.usersStatus[userIndex].doneAt = new Date();

            const t = await this.sequelize.transaction();

            try {
                task.changed('usersStatus', true);
                await task.save();

                if (usersStatus.every(({ doneAt }) => doneAt)) {
                    await task.update({ status: TASK_STATUSES.DONE });
                }
            } catch (error) {
                await t.rollback();

                throw error;
            }

            return res.sendStatus(StatusCodes.OK);
        }

        const isLoggedUserAdmin = await loggedUser.isAdmin();

        if (!isLoggedUserAdmin && status === TASK_STATUSES.CANCELLED) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send(messages.validators.tasks.onlyAdminCanCancelTask);
        }

        if (
            isLoggedUserAdmin &&
            status === TASK_STATUSES.CANCELLED &&
            taskStatus === TASK_STATUSES.PENDING
        ) {
            await task.update({ status: TASK_STATUSES.CANCELLED });

            return res.sendStatus(StatusCodes.OK);
        }

        return res
            .status(StatusCodes.BAD_REQUEST)
            .send(messages.validators.tasks.unsupportedStatusChange);
    }
}

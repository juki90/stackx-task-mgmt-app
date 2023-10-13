import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpGet,
    response,
    controller
} from 'inversify-express-utils';

import type { Request, Response } from 'express';
import type { Task, ITaskRepository, ITaskShowController } from '@/types';

@controller('/tasks')
export class TaskShowController implements ITaskShowController {
    constructor(
        @inject('repositories.task')
        public taskRepository: ITaskRepository
    ) {}

    @httpGet('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<Task | string>> {
        const {
            params: { id }
        } = req;

        const task = await this.taskRepository.findById(id, {
            include: [
                { association: 'users' },
                { association: 'createdBy' },
                { association: 'updatedBy' }
            ]
        });

        if (!task) {
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        return res.json(task);
    }
}

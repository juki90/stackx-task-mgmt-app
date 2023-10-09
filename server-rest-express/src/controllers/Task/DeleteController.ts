import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpDelete,
    response,
    controller
} from 'inversify-express-utils';

import type { Request, Response } from 'express';
import type { ITaskRepository, ITaskDeleteController } from '@/types';

@controller('/tasks')
export class TaskDeleteController implements ITaskDeleteController {
    constructor(
        @inject('repositories.task')
        public taskRepository: ITaskRepository
    ) {}

    @httpDelete('/:id')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<string>> {
        const {
            params: { id }
        } = req;

        const task = await this.taskRepository.findById(id);

        if (!task) {
            return res.sendStatus(StatusCodes.NO_CONTENT);
        }

        await task.destroy();

        return res.sendStatus(StatusCodes.NO_CONTENT);
    }
}

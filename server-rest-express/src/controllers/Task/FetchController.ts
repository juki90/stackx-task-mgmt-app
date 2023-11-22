import { inject } from 'inversify';
import {
    request,
    httpGet,
    response,
    controller
} from 'inversify-express-utils';

import type { Request, Response } from 'express';
import type { Task, ITaskRepository, ITaskFetchController } from '@/types';

@controller('/tasks')
export class TaskFetchController implements ITaskFetchController {
    constructor(
        @inject('repositories.task')
        public taskRepository: ITaskRepository
    ) {}

    @httpGet('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<Task[]>> {
        const { queryParams } = req;

        const tasks = await this.taskRepository.findAndCount(queryParams);

        return res.json(tasks);
    }
}

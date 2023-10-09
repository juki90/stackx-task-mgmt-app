import type { Request, Response } from 'express';
import type { Task, ITaskRepository, IUserRepository } from '@/types';

interface ITaskCreateController {
    taskRepository: ITaskRepository;
    userRepository: IUserRepository;
    invoke(
        req: Request,
        res: Response
    ): Promise<
        Response<
            Task | { message: string; field: string; data: string[] }[] | string
        >
    >;
}

interface ITaskUpdateController {
    taskRepository: ITaskRepository;
    userRepository: IUserRepository;
    invoke(req: Request, res: Response): Promise<Response<Task | string>>;
}

interface ITaskFetchController {
    taskRepository: ITaskRepository;
    invoke(req: Request, res: Response): Promise<Response<Task[]>>;
}

interface ITaskDeleteController {
    taskRepository: ITaskRepository;
    invoke(req: Request, res: Response): Promise<Response<string>>;
}

export {
    ITaskFetchController,
    ITaskCreateController,
    ITaskUpdateController,
    ITaskDeleteController
};

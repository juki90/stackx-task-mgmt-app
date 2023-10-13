import type { Request, Response } from 'express';
import type {
    Task,
    Sequelize,
    ITaskRepository,
    IUserRepository
} from '@/types';

interface ITaskCreateController {
    sequelize: Sequelize;
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
    sequelize: Sequelize;
    taskRepository: ITaskRepository;
    userRepository: IUserRepository;
    invoke(req: Request, res: Response): Promise<Response<Task | string>>;
}

interface ITaskFetchController {
    taskRepository: ITaskRepository;
    invoke(req: Request, res: Response): Promise<Response<Task[]>>;
}

interface ITaskShowController {
    taskRepository: ITaskRepository;
    invoke(req: Request, res: Response): Promise<Response<Task | string>>;
}

interface ITaskDeleteController {
    taskRepository: ITaskRepository;
    invoke(req: Request, res: Response): Promise<Response<string>>;
}

interface ITaskChangeStatusController {
    sequelize: Sequelize;
    taskRepository: ITaskRepository;
    invoke(req: Request, res: Response): Promise<Response<string>>;
}

export {
    ITaskShowController,
    ITaskFetchController,
    ITaskCreateController,
    ITaskUpdateController,
    ITaskDeleteController,
    ITaskChangeStatusController
};

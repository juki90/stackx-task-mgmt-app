import type { Request, Response } from 'express';
import type {
    User,
    Sequelize,
    IUserRepository,
    IRoleRepository
} from '@/types';

interface IUserCreateController {
    sequelize: Sequelize;
    userRepository: IUserRepository;
    roleRepository: IRoleRepository;
    invoke(req: Request, res: Response): Promise<Response<User | string>>;
}

interface IUserShowController {
    userRepository: IUserRepository;
    invoke(req: Request, res: Response): Promise<Response<User | string>>;
}

interface IUserUpdateController {
    sequelize: Sequelize;
    userRepository: IUserRepository;
    roleRepository: IRoleRepository;
    invoke(req: Request, res: Response): Promise<Response<User | string>>;
}

interface IUserDeleteController {
    userRepository: IUserRepository;
    invoke(req: Request, res: Response): Promise<Response<string>>;
}

interface IUserFetchController {
    userRepository: IUserRepository;
    invoke(
        req: Request,
        res: Response
    ): Promise<Response<{ rows: User[]; count: number }>>;
}

export {
    IUserShowController,
    IUserFetchController,
    IUserCreateController,
    IUserDeleteController,
    IUserUpdateController
};

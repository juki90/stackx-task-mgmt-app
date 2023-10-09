import type { Request, Response } from 'express';
import type { IUserRepository, IRoleRepository, User } from '@/types';

interface IUserCreateController {
    userRepository: IUserRepository;
    roleRepository: IRoleRepository;
    invoke(req: Request, res: Response): Promise<Response<User | string>>;
}

interface IUserUpdateController {
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
    invoke(req: Request, res: Response): Promise<Response<User[]>>;
}

export {
    IUserCreateController,
    IUserUpdateController,
    IUserDeleteController,
    IUserFetchController
};

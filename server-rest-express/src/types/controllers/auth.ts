import type { Request, Response } from 'express';
import type { IJwt, User, Bcrypt, IUserRepository } from '@/types';

interface ILoginController {
    bcrypt: Bcrypt;
    userRepository: IUserRepository;
    jwt: IJwt;
    invoke(req: Request, res: Response): Promise<Response<User | string>>;
}

interface IMeController {
    userRepository: IUserRepository;
    invoke(req: Request, res: Response): Promise<Response<User | string>>;
}

export { IMeController, ILoginController };

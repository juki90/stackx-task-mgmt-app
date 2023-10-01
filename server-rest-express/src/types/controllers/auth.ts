import type { Request, Response } from 'express';
import type { IJwt, Bcrypt, ILogger, IUserRepository } from '@/types';

interface ILoginController {
    bcrypt: Bcrypt;
    userRepository: IUserRepository;
    jwt: IJwt;
    logger: ILogger;
    invoke(req: Request, res: Response): Promise<Response>;
}

export { ILoginController };

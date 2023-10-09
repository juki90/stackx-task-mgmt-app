import { Router, type IRouter } from 'express';

import validate from '@/middlewares/validate';
import authValidator from '@/validators/auth';

import type { Container } from 'inversify';
import type { ILoginController } from '@/types';
import type { Request, Response } from 'express';

const router: IRouter = Router();

export default async (di: Container): Promise<IRouter> => {
    const authLoginController = di.get<ILoginController>(
        'controllers.auth.login'
    );

    router.post(
        '/login',
        authValidator.login,
        validate,
        (req: Request, res: Response) => authLoginController.invoke(req, res)
    );

    return router;
};

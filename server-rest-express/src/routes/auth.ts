import { Router, type IRouter } from 'express';

import validate from '@/middlewares/validate';
import checkJwt from '@/middlewares/checkJwt';
import authValidator from '@/validators/auth';

import type { Container } from 'inversify';
import type { Request, Response } from 'express';
import type { ILoginController, IMeController } from '@/types';

const router: IRouter = Router();

export default async (di: Container): Promise<IRouter> => {
    const authLoginController = di.get<ILoginController>(
        'controllers.auth.login'
    );
    const authMeController = di.get<IMeController>('controllers.auth.me');

    router.post(
        '/login',
        authValidator.login,
        validate,
        (req: Request, res: Response) => authLoginController.invoke(req, res)
    );

    router.get('/me', checkJwt, (req: Request, res: Response) =>
        authMeController.invoke(req, res)
    );

    return router;
};

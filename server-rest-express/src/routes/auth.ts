import { Router, IRouter } from 'express';
import { Request, Response } from 'express';

import validate from '@/middlewares/validate';
import { loginValidator } from '@/validators/auth';

import type { Container } from 'inversify';
import type { ILoginController } from '@/types';

const router: IRouter = Router();

export default async (di: Container): Promise<IRouter> => {
    const loginController: ILoginController = di.get('controllers.auth.login');

    router.post(
        '/login',
        loginValidator,
        validate,
        (req: Request, res: Response) => loginController.invoke(req, res)
    );

    return router;
};

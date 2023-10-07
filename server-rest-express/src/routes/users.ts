import { Router, IRouter } from 'express';
import { Request, Response } from 'express';

import checkJwt from '@/middlewares/checkJwt';
import validate from '@/middlewares/validate';
import usersValidator from '@/validators/users';
import checkAdminRole from '@/middlewares/checkAdminRole';
import createQueryParamsParser from '@/middlewares/createQueryParamsParser';

import type { Container } from 'inversify';
import type {
    IUserFetchController,
    IUserCreateController,
    IUserUpdateController,
    IUserDeleteController
} from '@/types';

const router: IRouter = Router();

const parseQueryParams = createQueryParamsParser('users');

export default async (di: Container): Promise<IRouter> => {
    const userFetchController = di.get<IUserFetchController>(
        'controllers.users.fetch'
    );
    const userCreateController = di.get<IUserCreateController>(
        'controllers.users.create'
    );
    const userUpdateController = di.get<IUserUpdateController>(
        'controllers.users.update'
    );
    const userDeleteController = di.get<IUserDeleteController>(
        'controllers.users.delete'
    );

    router.get(
        '/',
        usersValidator.fetch,
        validate,
        checkJwt,
        checkAdminRole,
        parseQueryParams,
        (req: Request, res: Response) => userFetchController.invoke(req, res)
    );

    router.post(
        '/',
        usersValidator.save,
        validate,
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => userCreateController.invoke(req, res)
    );

    router.put(
        '/:id',
        usersValidator.save,
        validate,
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => userUpdateController.invoke(req, res)
    );

    router.delete(
        '/:id',
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => userDeleteController.invoke(req, res)
    );

    return router;
};

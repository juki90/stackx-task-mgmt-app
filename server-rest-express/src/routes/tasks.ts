import { Router, type IRouter } from 'express';

import checkJwt from '@/middlewares/checkJwt';
import validate from '@/middlewares/validate';
import tasksValidator from '@/validators/tasks';
import checkAdminRole from '@/middlewares/checkAdminRole';
import createQueryParamsParser from '@/middlewares/createQueryParamsParser';

import type { Container } from 'inversify';
import type { Request, Response } from 'express';
import type {
    ITaskShowController,
    ITaskFetchController,
    ITaskCreateController,
    ITaskUpdateController,
    ITaskDeleteController,
    ITaskChangeStatusController
} from '@/types';

const router: IRouter = Router();

const parseQueryParams = createQueryParamsParser('tasks');

export default async (di: Container): Promise<IRouter> => {
    const taskFetchController = di.get<ITaskFetchController>(
        'controllers.task.fetch'
    );
    const taskShowController = di.get<ITaskShowController>(
        'controllers.task.show'
    );
    const taskCreateController = di.get<ITaskCreateController>(
        'controllers.task.create'
    );
    const taskUpdateController = di.get<ITaskUpdateController>(
        'controllers.task.update'
    );
    const taskChangeStatusController = di.get<ITaskChangeStatusController>(
        'controllers.task.changeStatus'
    );
    const taskDeleteController = di.get<ITaskDeleteController>(
        'controllers.task.delete'
    );

    router.get(
        '/',
        tasksValidator.fetch,
        validate,
        checkJwt,
        checkAdminRole,
        parseQueryParams,
        (req: Request, res: Response) => taskFetchController.invoke(req, res)
    );

    router.get(
        '/:id',
        tasksValidator.show,
        validate,
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => taskShowController.invoke(req, res)
    );

    router.post(
        '/',
        tasksValidator.create,
        validate,
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => taskCreateController.invoke(req, res)
    );

    router.put(
        '/:id',
        tasksValidator.update,
        validate,
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => taskUpdateController.invoke(req, res)
    );

    router.patch(
        '/:id',
        tasksValidator.changeStatus,
        validate,
        checkJwt,
        (req: Request, res: Response) =>
            taskChangeStatusController.invoke(req, res)
    );

    router.delete(
        '/:id',
        tasksValidator.remove,
        validate,
        checkJwt,
        checkAdminRole,
        (req: Request, res: Response) => taskDeleteController.invoke(req, res)
    );

    return router;
};

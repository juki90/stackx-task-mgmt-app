import path from 'path';
import { promises as fs } from 'fs';
import { Router, IRouter } from 'express';

import type { Container } from 'inversify';

const router: IRouter = Router();

export default async (di: Container): Promise<IRouter> => {
    const files: string[] = await fs.readdir(__dirname);

    for (const file of files) {
        const [route] = file.split('.');

        if (route === 'index') {
            continue;
        }

        const { default: getRouter } = await import(
            path.join(__dirname, route)
        );
        const routeRouter = await getRouter(di);

        router.use(`/${route}`, routeRouter);
    }

    return router;
};

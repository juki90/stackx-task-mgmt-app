import 'reflect-metadata';
import express, { type IRouter, type Express } from 'express';

import initDi from '@/di';
import getRoutes from '@/routes';
import useCors from '@/plugins/useCors';

import type { Container } from 'inversify';

const createApp = async (): Promise<Express> => {
    const app: Express = express();
    const di: Container = await initDi();
    const routes: IRouter = await getRoutes(di);

    useCors(app);
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.set('di', di);
    app.use('/api', routes);

    return app;
};

export default createApp;

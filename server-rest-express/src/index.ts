import 'reflect-metadata';
import express, { type Express } from 'express';

import initDi from '@/di';
import useCors from '@/plugins/useCors';

import type { Sequelize } from '@/types';
import type { Container } from 'inversify';

const createApp = async (): Promise<Express> => {
    const app: Express = express();
    const di: Container = await initDi();

    useCors(app);
    app.use(express.json({ limit: '1mb' }));

    const sequelizeDb: Sequelize = await di.getAsync('sequelize');

    return app;
};

export default createApp;

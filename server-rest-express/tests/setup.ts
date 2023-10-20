/* eslint-disable no-var */
import 'reflect-metadata';

import initDi from '@/di';

import type { Sequelize } from 'sequelize';

afterAll(async () => {
    jest.clearAllMocks();

    const di = await initDi();
    const sequelize = di.get<Sequelize>('services.sequelize');

    await sequelize.close();
});

jest.setTimeout(30000);

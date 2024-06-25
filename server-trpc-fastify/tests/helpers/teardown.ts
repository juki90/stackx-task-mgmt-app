/* eslint-disable no-var */
import 'reflect-metadata';

import initDi from '~/di';

import { TPrisma } from '~/types';

export const teardown = async app => {
    const di = await initDi();
    const prisma = di.get<TPrisma>('%prisma');

    await prisma.$disconnect();
    app.close();
};

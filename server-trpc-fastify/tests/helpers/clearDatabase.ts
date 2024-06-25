import { Prisma } from '@prisma/client';

import initDi from '~/di';

import type { TPrisma } from '~/types';

export default async () => {
    console.info('Clearing Postgres DB starts...');

    const di = await initDi();
    const prisma = di.get<TPrisma>('%prisma');

    const tables = Prisma.dmmf.datamodel.models
        .map(model => model.dbName)
        .filter(table => table);

    await Promise.all(
        tables.map(table =>
            prisma.$executeRawUnsafe(`DELETE FROM "${table}" CASCADE;`)
        )
    );
};

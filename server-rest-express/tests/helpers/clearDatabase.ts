import initDi from '@/di';

import type { Sequelize } from '@/types';

export default async () => {
    console.info('Clearing Postgres DB starts...');

    const di = await initDi();
    const sequelize = di.get<Sequelize>('services.sequelize');

    await Promise.all(
        Object.values(sequelize.models).map(model =>
            model.destroy({ where: {}, force: true })
        )
    );
};

import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

import { envConfig } from '@/config';

const {
    postgres: { url, pool }
} = envConfig;

const sequelize = new Sequelize(url, { pool });

export const umzug = new Umzug({
    migrations: { glob: 'src/migrations/!(*index).ts' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console
});

export type Migration = typeof umzug._types.migration;

if (require.main === module) {
    umzug.runAsCLI();
}

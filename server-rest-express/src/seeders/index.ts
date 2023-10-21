import path from 'path';
import { Umzug, SequelizeStorage } from 'umzug';
import { Sequelize } from 'sequelize-typescript';

import { envConfig } from '@/config';

const {
    postgres: { url, pool }
} = envConfig;
const sequelize = new Sequelize(url, {
    pool,
    models: [path.join(__dirname, '..', 'models')]
});
const fileExtension = path.extname(__filename);

export const umzug = new Umzug({
    migrations: {
        glob: `${fileExtension === '.ts' ? 'src' : 'dist'}/seeders/!(*index).*`
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console
});

export type Migration = typeof umzug._types.migration;

if (require.main === module) {
    umzug.runAsCLI();
}

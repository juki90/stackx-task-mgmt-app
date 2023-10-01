import { injectable } from 'inversify';

import type {
    ILogger,
    Sequelize,
    PlatformPath,
    EnvConfigPostgres,
    SequelizeTypescript
} from '@/types';

@injectable()
export class SequelizeFactory {
    static async create(
        path: PlatformPath,
        { Sequelize }: SequelizeTypescript,
        logger: ILogger,
        { url, pool }: EnvConfigPostgres
    ): Promise<Sequelize> {
        try {
            const sequelize: Sequelize = new Sequelize(url, {
                pool,
                models: [path.join(__dirname, '..', 'models')]
            });

            await sequelize.authenticate();

            logger.info(
                'Successfully authenticated and estabilished connection to postres database'
            );

            return sequelize;
        } catch (error) {
            logger.error('Unable to connect to postgres database: ', error);
        }
    }
}

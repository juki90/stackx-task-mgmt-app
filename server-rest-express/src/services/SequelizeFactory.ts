import { injectable } from 'inversify';

import type {
    ILogger,
    EnvConfig,
    Sequelize,
    PlatformPath,
    SequelizeTypescript
} from '@/types';

@injectable()
export class SequelizeFactory {
    static async create(
        path: PlatformPath,
        { Sequelize }: SequelizeTypescript,
        logger: ILogger,
        { app: { env }, postgres: { url, pool } }: EnvConfig
    ): Promise<Sequelize> {
        try {
            const sequelize: Sequelize = new Sequelize(url, {
                pool,
                models: [path.join(__dirname, '..', 'models')],
                logging: env === 'test' ? false : console.log,
                dialectOptions: {
                    statement_timeout: 60000,
                    idle_in_transaction_session_timeout: 60000
                }
            });

            await sequelize.authenticate();

            if (env === 'test') {
                await sequelize.sync({ force: true });
            }

            logger.info(
                'Successfully authenticated and estabilished connection to postres database'
            );

            return sequelize;
        } catch (error) {
            logger.error('Unable to connect to postgres database: ', error);
        }
    }
}

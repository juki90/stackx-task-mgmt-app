import { injectable } from 'inversify';

import type {
    ILogger,
    Sequelize,
    PlatformFs,
    PlatformPath,
    EnvConfigPostgres,
    SequelizeTypescript
} from '@/types';

@injectable()
export class SequelizeFactory {
    static async create(
        fs: PlatformFs,
        path: PlatformPath,
        { Sequelize }: SequelizeTypescript,
        logger: ILogger,
        { url, pool }: EnvConfigPostgres
    ): Promise<Sequelize> {
        try {
            const baseModelUrl = path.join(__dirname, '..', 'models');
            const baseFileExtension = path.extname(__filename);
            const fileExtensionRegex = new RegExp(baseFileExtension);

            const modelNames = await fs.readdir(baseModelUrl);
            const modelClasses = await Promise.all(
                modelNames
                    .filter(
                        fileName =>
                            fileName.indexOf('.') !== 0 &&
                            fileExtensionRegex.test(fileName)
                    )
                    .map(async fileName => {
                        const { default: model } = await import(
                            path.join(baseModelUrl, fileName)
                        );

                        return model;
                    })
            );
            const sequelize = new Sequelize(url, {
                pool,
                models: modelClasses,
                repositoryMode: true
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

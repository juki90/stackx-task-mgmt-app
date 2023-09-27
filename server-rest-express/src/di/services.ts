import { Logger } from '@/services/Logger';
import { SequelizeFactory } from '@/services/SequelizeFactory';

import type { Container } from 'inversify';
import type {
    ILogger,
    Sequelize,
    PlatformFs,
    PlatformPath,
    EnvConfigPostgres,
    SequelizeTypescript
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<ILogger>('logger').to(Logger);
    container
        .bind<Sequelize>('sequelize')
        .toDynamicValue(({ container }) =>
            SequelizeFactory.create(
                container.get<PlatformFs>('%fs'),
                container.get<PlatformPath>('%path'),
                container.get<SequelizeTypescript>('%sequelize-typescript'),
                container.get<ILogger>('logger'),
                container.get<EnvConfigPostgres>('%config.postgres%')
            )
        );
};

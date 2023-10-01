import { Jwt } from '@/services/Jwt';
import { Logger } from '@/services/Logger';
import { SequelizeFactory } from '@/services/SequelizeFactory';

import type { Container } from 'inversify';
import type {
    IJwt,
    ILogger,
    Sequelize,
    PlatformPath,
    EnvConfigPostgres,
    SequelizeTypescript
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<ILogger>('services.logger').to(Logger);
    container.bind<IJwt>('services.jwt').to(Jwt);
    container
        .bind<Sequelize>('services.sequelize')
        .toDynamicValue(({ container }) =>
            SequelizeFactory.create(
                container.get<PlatformPath>('%path'),
                container.get<SequelizeTypescript>('%sequelize-typescript'),
                container.get<ILogger>('services.logger'),
                container.get<EnvConfigPostgres>('%config.postgres%')
            )
        );
};

import { envConfig } from '@/config';

import type { Container } from 'inversify';
import type {
    EnvConfig,
    EnvConfigJwt,
    EnvConfigApp,
    EnvConfigPostgres
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<EnvConfig>('%config%').toConstantValue(envConfig);
    container.bind<EnvConfigApp>('%config.app%').toConstantValue(envConfig.app);
    container
        .bind<EnvConfigPostgres>('%config.postgres%')
        .toConstantValue(envConfig.postgres);
    container.bind<EnvConfigJwt>('%config.jwt%').toConstantValue(envConfig.jwt);
};

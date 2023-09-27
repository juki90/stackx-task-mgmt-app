import { envConfig } from '@/config';

import type { Container } from 'inversify';
import type { EnvConfig, EnvConfigPostgres } from '@/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<EnvConfig>('%config%').toConstantValue(envConfig);
    container
        .bind<EnvConfigPostgres>('%config.postgres%')
        .toConstantValue(envConfig.postgres);
};

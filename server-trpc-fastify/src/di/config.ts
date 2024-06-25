import { envConfig } from '~/config';

import type { Container } from 'inversify';
import type { EnvConfig, EnvConfigJwt, EnvConfigApp } from '~/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<EnvConfig>('%config%').toConstantValue(envConfig);
    container.bind<EnvConfigApp>('%config.app%').toConstantValue(envConfig.app);
    container.bind<EnvConfigJwt>('%config.jwt%').toConstantValue(envConfig.jwt);
};

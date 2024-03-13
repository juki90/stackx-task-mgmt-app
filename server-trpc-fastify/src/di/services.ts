import { Logger } from '~/services/Logger';
import { JwtService } from '~/services/Jwt';

import type { Container } from 'inversify';
import type { IJwt, ILogger } from '~/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<ILogger>('services.logger').to(Logger);
    container.bind<IJwt>('services.jwt').to(JwtService);
};

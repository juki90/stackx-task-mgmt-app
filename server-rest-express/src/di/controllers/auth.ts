import { MeController } from '@/controllers/Auth/MeController';
import { LoginController } from '@/controllers/Auth/LoginController';

import type { Container } from 'inversify';
import type { IMeController, ILoginController } from '@/types';

export const useConfig: (container: Container) => void = container => {
    container
        .bind<ILoginController>('controllers.auth.login')
        .to(LoginController);
    container.bind<IMeController>('controllers.auth.me').to(MeController);
};

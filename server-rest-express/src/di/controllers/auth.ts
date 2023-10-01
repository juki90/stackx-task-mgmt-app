import { LoginController } from '@/controllers/Auth/LoginController';

import type { Container } from 'inversify';
import type { ILoginController } from '@/types';

export const useConfig: (container: Container) => void = container => {
    container
        .bind<ILoginController>('controllers.auth.login')
        .to(LoginController);
};

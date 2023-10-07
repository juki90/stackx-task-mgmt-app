import { UserCreateController } from '@/controllers/User/CreateController';
import { UserUpdateController } from '@/controllers/User/UpdateController';
import { UserDeleteController } from '@/controllers/User/DeleteController';
import { UserFetchController } from '@/controllers/User/FetchController';

import type { Container } from 'inversify';
import type {
    IUserFetchController,
    IUserCreateController,
    IUserDeleteController,
    IUserUpdateController
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container
        .bind<IUserFetchController>('controllers.users.fetch')
        .to(UserFetchController);
    container
        .bind<IUserCreateController>('controllers.users.create')
        .to(UserCreateController);
    container
        .bind<IUserUpdateController>('controllers.users.update')
        .to(UserUpdateController);
    container
        .bind<IUserDeleteController>('controllers.users.delete')
        .to(UserDeleteController);
};

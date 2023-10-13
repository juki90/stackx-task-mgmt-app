import { UserShowController } from '@/controllers/User/ShowController';
import { UserFetchController } from '@/controllers/User/FetchController';
import { UserCreateController } from '@/controllers/User/CreateController';
import { UserUpdateController } from '@/controllers/User/UpdateController';
import { UserDeleteController } from '@/controllers/User/DeleteController';

import type { Container } from 'inversify';
import type {
    IUserFetchController,
    IUserCreateController,
    IUserDeleteController,
    IUserUpdateController,
    IUserShowController
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container
        .bind<IUserFetchController>('controllers.users.fetch')
        .to(UserFetchController);
    container
        .bind<IUserShowController>('controllers.users.show')
        .to(UserShowController);
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

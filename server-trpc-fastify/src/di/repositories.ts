import { RoleRepository } from '~/repositories/Role';
import { UserRepository } from '~/repositories/User';
import { TaskRepository } from '~/repositories/Task';

import type { Container } from 'inversify';
import type {
    IRoleRepository,
    IUserRepository,
    ITaskRepository
} from '~/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<IRoleRepository>('repositories.role').to(RoleRepository);
    container.bind<IUserRepository>('repositories.user').to(UserRepository);
    container.bind<ITaskRepository>('repositories.task').to(TaskRepository);
};

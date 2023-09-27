import { RoleRepository } from '@/repositories/Role';
import { UserRepository } from '@/repositories/User';

import type { Container } from 'inversify';
import type { IRoleRepository, IUserRepository } from '@/types';

export const useConfig: (container: Container) => void = container => {
    container.bind<IRoleRepository>('repositories.role').to(RoleRepository);
    container.bind<IUserRepository>('repositories.user').to(UserRepository);
};

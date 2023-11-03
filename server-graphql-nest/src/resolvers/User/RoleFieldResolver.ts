import { Parent, Resolver, ResolveField } from '@nestjs/graphql';

import { User } from '@/entities/User';
import { Role } from '@/entities/Role';
import { RoleRepository } from '@/repositories/Role';

@Resolver('User')
export class UserRoleFieldResolver {
    constructor(private readonly roleRepository: RoleRepository) {}

    @ResolveField('role')
    async fetchRoleOfUser(@Parent() user: User): Promise<Role> {
        return this.roleRepository
            .createQueryBuilder('role')
            .innerJoin('role.users', 'users', 'users.id = :userId', {
                userId: user.id
            })
            .getOne();
    }
}

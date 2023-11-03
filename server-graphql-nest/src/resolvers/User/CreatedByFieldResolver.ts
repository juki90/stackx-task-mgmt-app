import { Parent, Resolver, ResolveField } from '@nestjs/graphql';

import { User } from '@/entities/User';
import { UserRepository } from '@/repositories/User';

@Resolver('User')
export class UserCreatedByFieldResolver {
    constructor(private readonly userRepository: UserRepository) {}

    @ResolveField('createdBy')
    async getCreatedByOfUser(@Parent() user: User): Promise<User> {
        const { createdBy } = await this.userRepository.findOne({
            where: { id: user.id },
            relations: { createdBy: true }
        });

        return createdBy;
    }
}

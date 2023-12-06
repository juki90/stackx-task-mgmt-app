import { Parent, Resolver, ResolveField } from '@nestjs/graphql';

import { User } from '@/entities/User';
import { Task } from '@/entities/Task';
import { UserRepository } from '@/repositories/User';

@Resolver('Task')
export class TaskUsersFieldResolver {
    constructor(private readonly userRepository: UserRepository) {}

    @ResolveField('users')
    fetchUsersOfTask(@Parent() task: Task): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder('user')
            .withDeleted()
            .innerJoin('user.tasks', 'tasks', 'tasks.id = :taskId', {
                taskId: task.id
            })
            .getMany();
    }
}

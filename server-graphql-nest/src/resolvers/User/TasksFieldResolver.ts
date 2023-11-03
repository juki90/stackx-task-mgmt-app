import { Parent, Resolver, ResolveField } from '@nestjs/graphql';

import { Task } from '@/entities/Task';
import { User } from '@/entities/User';
import { TaskRepository } from '@/repositories/Task';

@Resolver('User')
export class UserTasksFieldResolver {
    constructor(private readonly taskRepository: TaskRepository) {}

    @ResolveField('tasks')
    async fetchTasksOfUser(@Parent() user: User): Promise<Task[]> {
        return this.taskRepository
            .createQueryBuilder('task')
            .innerJoin('task.users', 'users', 'users.id = :userId', {
                userId: user.id
            })
            .getMany();
    }
}

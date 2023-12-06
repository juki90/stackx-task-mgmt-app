import { Parent, Resolver, ResolveField } from '@nestjs/graphql';

import { Task } from '@/entities/Task';
import { User } from '@/entities/User';
import { TaskRepository } from '@/repositories/Task';

@Resolver('Task')
export class TaskUpdatedByFieldResolver {
    constructor(private readonly taskRepository: TaskRepository) {}

    @ResolveField('updatedBy')
    async getUpdatedByOfTask(@Parent() task: Task): Promise<User> {
        const { updatedBy } = await this.taskRepository.findOne({
            where: { id: task.id },
            relations: { updatedBy: true },
            withDeleted: true
        });

        return updatedBy;
    }
}

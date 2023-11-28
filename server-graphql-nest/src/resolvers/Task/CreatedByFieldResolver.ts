import { Parent, Resolver, ResolveField } from '@nestjs/graphql';

import { Task } from '@/entities/Task';
import { User } from '@/entities/User';
import { TaskRepository } from '@/repositories/Task';

@Resolver('Task')
export class TaskCreatedByFieldResolver {
    constructor(private readonly taskRepository: TaskRepository) {}

    @ResolveField('createdBy')
    async getCreatedByOfTask(@Parent() task: Task): Promise<User> {
        const { createdBy } = await this.taskRepository.findOne({
            where: { id: task.id },
            relations: { createdBy: true },
            withDeleted: true
        });

        return createdBy;
    }
}

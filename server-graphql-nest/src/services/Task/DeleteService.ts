import { Injectable } from '@nestjs/common';

import { TaskRepository } from '@/repositories/Task';

import type { Task } from '@/graphql';

@Injectable()
export class TasksDeleteService {
    constructor(private taskRepository: TaskRepository) {}

    async delete(id: string): Promise<Task | null> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            return null;
        }

        return this.taskRepository.delete(id);
    }
}

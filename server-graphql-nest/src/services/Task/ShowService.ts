import { Injectable } from '@nestjs/common';

import { en as messages } from '@/locales';
import { TaskRepository } from '@/repositories/Task';

import type { Task } from '@/graphql';
import { UserInputError } from 'apollo-server-express';

@Injectable()
export class TasksShowService {
    constructor(private taskRepository: TaskRepository) {}

    async findById(id: string): Promise<Task> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new UserInputError(messages.notFound);
        }

        return this.taskRepository.findById(id);
    }
}

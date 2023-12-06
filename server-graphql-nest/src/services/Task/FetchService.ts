import { Injectable } from '@nestjs/common';
import { FindManyOptions, Like } from 'typeorm';

import { TaskRepository } from '@/repositories/Task';

import type { PageArg, Task } from '@/graphql';

@Injectable()
export class TasksFetchService {
    constructor(private taskRepository: TaskRepository) {}

    async findAll(
        { size, index }: PageArg,
        filter: string
    ): Promise<{ rows: Task[]; count: number }> {
        const options: FindManyOptions<Task> = {};

        if (filter) {
            options.where = [
                { title: Like(`%${filter}%`) },
                { description: Like(`%${filter}%`) }
            ];
        }

        options.take = size;
        options.skip = size * index;
        options.order = {
            updatedAt: 'DESC'
        };

        const [rows, count] =
            await this.taskRepository.findAllAndCount(options);

        return { rows, count };
    }
}

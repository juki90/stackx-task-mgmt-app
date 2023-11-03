import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { TasksDeleteService } from '@/services/Task/DeleteService';

import type { Task } from '@/graphql';

@Resolver()
export class TaskDeleteResolver {
    constructor(private readonly tasksDeleteService: TasksDeleteService) {}

    @Mutation('deleteTask')
    @UseGuards(JwtGuard, AdminGuard)
    async delete(@Args('id') id: string): Promise<Task> {
        return this.tasksDeleteService.delete(id);
    }
}

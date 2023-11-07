import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { TasksShowService } from '@/services/Task/ShowService';

import type { Task } from '@/graphql';

@Resolver()
export class TaskShowResolver {
    constructor(private readonly tasksShowService: TasksShowService) {}

    @Query('task')
    @UseGuards(JwtGuard, AdminGuard)
    findOne(@Args('id') id: string): Promise<Task> {
        return this.tasksShowService.findById(id);
    }
}

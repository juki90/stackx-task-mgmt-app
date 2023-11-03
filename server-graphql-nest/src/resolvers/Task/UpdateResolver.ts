import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { CreateTaskInputDto } from '@/dto/Task/CreateDto';
import { TasksUpdateService } from '@/services/Task/UpdateService';

import type { Request } from 'express';
import type * as GraphQlTypes from '@/graphql';

@Resolver()
export class TaskUpdateResolver {
    constructor(private readonly tasksUpdateService: TasksUpdateService) {}

    @Mutation('updateTask')
    @UseGuards(JwtGuard, AdminGuard)
    update(
        @Args('id') id: string,

        @Args('updateTaskInput')
        updateTaskInput: CreateTaskInputDto,

        @Context() ctx: { req: Request }
    ): Promise<GraphQlTypes.Task> {
        return this.tasksUpdateService.update(
            id,
            updateTaskInput,
            ctx.req.loggedUser
        );
    }
}

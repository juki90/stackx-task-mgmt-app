import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { CreateTaskInputDto } from '@/dto/Task/CreateDto';
import { TasksCreateService } from '@/services/Task/CreateService';

import type { Request } from 'express';
import type * as GraphQlTypes from '@/graphql';

@Resolver()
export class TaskCreateResolver {
    constructor(private readonly tasksService: TasksCreateService) {}

    @Mutation('createTask')
    @UseGuards(JwtGuard, AdminGuard)
    create(
        @Args('createTaskInput') createTaskInputDto: CreateTaskInputDto,

        @Context() ctx: { req: Request }
    ): Promise<GraphQlTypes.Task> {
        return this.tasksService.create(createTaskInputDto, ctx.req.loggedUser);
    }
}

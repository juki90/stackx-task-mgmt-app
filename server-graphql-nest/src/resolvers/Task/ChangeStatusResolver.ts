import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { ChangeTaskStatusInputDto } from '@/dto/Task/ChangeStatusDto';
import { TaskChangeStatusService } from '@/services/Task/ChangeStatusService';

import type { Request } from 'express';
import type * as GraphQlTypes from '@/graphql';

@Resolver()
export class TaskChangeStatusResolver {
    constructor(
        private readonly taskChangeStatusService: TaskChangeStatusService
    ) {}

    @Mutation('changeTaskStatus')
    @UseGuards(JwtGuard)
    create(
        @Args('id') id: string,

        @Args('changeTaskStatusInput')
        changeTaskStatusInput: ChangeTaskStatusInputDto,

        @Context() ctx: { req: Request }
    ): Promise<GraphQlTypes.Task> {
        return this.taskChangeStatusService.changeStatus(
            id,
            changeTaskStatusInput,
            ctx.req.loggedUser
        );
    }
}

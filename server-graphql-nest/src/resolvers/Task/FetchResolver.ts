import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { PageArgsInputDto } from '@/dto/Shared/PageArgDto';
import { TasksFetchService } from '@/services/Task/FetchService';

import type { Task } from '@/graphql';

@Resolver()
export class TasksFetchResolver {
    constructor(private readonly tasksFetchService: TasksFetchService) {}

    @Query('tasks')
    @UseGuards(JwtGuard, AdminGuard)
    findAll(
        @Args('page') page: PageArgsInputDto,

        @Args('filter') filter: string
    ): Promise<{ rows: Task[]; count: number }> {
        return this.tasksFetchService.findAll(page, filter);
    }
}

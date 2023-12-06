import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { PageArgsInputDto } from '@/dto/Shared/PageArgDto';
import { UsersFetchService } from '@/services/User/FetchService';

import type { User } from '@/graphql';

@Resolver()
export class UsersFetchResolver {
    constructor(private readonly usersFetchService: UsersFetchService) {}

    @Query('users')
    @UseGuards(JwtGuard, AdminGuard)
    findAll(
        @Args('page') page: PageArgsInputDto,

        @Args('filter') filter: string
    ): Promise<{ rows: User[]; count: number }> {
        return this.usersFetchService.findAll(page, filter);
    }
}

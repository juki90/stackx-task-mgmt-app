import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { UsersShowService } from '@/services/User/ShowService';

import type { User } from '@/graphql';

@Resolver()
export class UserShowResolver {
    constructor(private readonly usersShowService: UsersShowService) {}

    @Query('user')
    @UseGuards(JwtGuard, AdminGuard)
    findOne(@Args('id') id: string): Promise<User> {
        return this.usersShowService.findById(id);
    }
}

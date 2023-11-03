import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { UsersDeleteService } from '@/services/User/DeleteService';

import type { User } from '@/graphql';
import type { Request } from 'express';

@Resolver()
export class UserDeleteResolver {
    constructor(private readonly usersDeleteService: UsersDeleteService) {}

    @Mutation('deleteUser')
    @UseGuards(JwtGuard, AdminGuard)
    async delete(
        @Args('id') id: string,

        @Context() ctx: { req: Request }
    ): Promise<User> {
        return this.usersDeleteService.delete(id, ctx.req.loggedUser);
    }
}

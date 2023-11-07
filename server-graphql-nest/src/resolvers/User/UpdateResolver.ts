import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { UpdateUserInputDto } from '@/dto/User/UpdateDto';
import { UsersUpdateService } from '@/services/User/UpdateService';

import type { User } from '@/graphql';
import type { Request } from 'express';

@Resolver()
export class UserUpdateResolver {
    constructor(private readonly usersUpdateService: UsersUpdateService) {}

    @Mutation('updateUser')
    @UseGuards(JwtGuard, AdminGuard)
    update(
        @Args('id') id: string,

        @Args('updateUserInput')
        updateUserInput: UpdateUserInputDto,

        @Context() ctx: { req: Request }
    ): Promise<User> {
        return this.usersUpdateService.update(
            id,
            updateUserInput,
            ctx.req.loggedUser
        );
    }
}

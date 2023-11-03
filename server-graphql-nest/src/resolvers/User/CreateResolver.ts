import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { AdminGuard } from '@/middlewares/AdminGuard';
import { CreateUserInputDto } from '@/dto/User/CreateDto';
import { UsersCreateService } from '@/services/User/CreateService';

import type * as GraphQlTypes from '@/graphql';
import type { Request } from 'express';

@Resolver()
export class UserCreateResolver {
    constructor(private readonly usersCreateService: UsersCreateService) {}

    @Mutation('createUser')
    @UseGuards(JwtGuard, AdminGuard)
    create(
        @Args('createUserInput') createUserInput: CreateUserInputDto,

        @Context() ctx: { req: Request }
    ): Promise<GraphQlTypes.User> {
        return this.usersCreateService.create(
            createUserInput,
            ctx.req.loggedUser
        );
    }
}

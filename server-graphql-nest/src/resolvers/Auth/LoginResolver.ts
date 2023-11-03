import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { LoginInputDto } from '@/dto/Auth/LoginDto';
import { LoginService } from '@/services/Auth/LoginService';

import type { Request } from 'express';
import type * as GraphQlTypes from '@/graphql';

@Resolver()
export class LoginResolver {
    constructor(private readonly loginService: LoginService) {}

    @Mutation('login')
    create(
        @Context() ctx: { req: Request },

        @Args('loginInput') loginInput: LoginInputDto
    ): Promise<GraphQlTypes.User> {
        return this.loginService.login(loginInput, ctx.req.res);
    }
}

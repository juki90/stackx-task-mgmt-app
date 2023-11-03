import { UseGuards } from '@nestjs/common';
import { Query, Context, Resolver } from '@nestjs/graphql';

import { JwtGuard } from '@/middlewares/JwtGuard';
import { MeService } from '@/services/Auth/MeService';

import type { Request } from 'express';
import type * as GraphQlTypes from '@/graphql';

@Resolver()
export class MeResolver {
    constructor(private readonly meService: MeService) {}

    @Query('me')
    @UseGuards(JwtGuard)
    me(@Context() ctx: { req: Request }): Promise<GraphQlTypes.User> {
        return this.meService.me(ctx.req.loggedUser.id);
    }
}

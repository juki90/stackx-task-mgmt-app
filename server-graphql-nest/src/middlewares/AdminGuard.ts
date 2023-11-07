import { ForbiddenError } from 'apollo-server-express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { en as messages } from '@/locales';
import { ROLE_NAMES } from '@/entities/Role';
import { JwtAuthService } from '@/services/JwtAuth';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtAuthService: JwtAuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { req } = context.getArgs()[2];

        if (req?.loggedUser?.role?.name !== ROLE_NAMES.ADMIN) {
            throw new ForbiddenError(messages.forbidden);
        }

        return true;
    }
}

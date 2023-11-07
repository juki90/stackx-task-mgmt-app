import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { en as messages } from '@/locales';
import { JwtAuthService } from '@/services/JwtAuth';

import { AuthenticationError } from 'apollo-server-express';

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private jwtAuthService: JwtAuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { req } = context.getArgs()[2];

        const verification = await this.jwtAuthService.verify(
            req.headers.authorization
        );

        if (!verification) {
            throw new AuthenticationError(messages.loginSessionExpired);
        }

        const { refreshedToken, loggedUser } = verification;

        req.res.setHeader('X-Auth-Token', refreshedToken);
        req.loggedUser = loggedUser;

        return true;
    }
}

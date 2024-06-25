import { inject, injectable } from 'inversify';

import { envConfig } from '~/config';
import { USER } from '~/config/constants';

import type {
    User,
    JsonWebToken,
    EnvConfigJwt,
    IUserRepository
} from '~/types';

@injectable()
export class JwtService {
    constructor(
        @inject('%jsonwebtoken') private jwt: JsonWebToken,

        @inject('repositories.user') public userRepository: IUserRepository,

        @inject('%config.jwt%') private jwtConfig: EnvConfigJwt
    ) {}

    sign(user: User): string {
        const token = this.jwt.sign(user, this.jwtConfig.secret, {
            expiresIn: this.jwtConfig.expiresIn
        });

        return `Bearer ${token}`;
    }

    async verify(authHeader: string): Promise<{
        refreshedToken: string;
        loggedUser: User;
    } | null> {
        try {
            const tokenMatch = /Bearer (\S+)/g.exec(authHeader);

            if (!tokenMatch || tokenMatch.length < 1) {
                return null;
            }

            const [, token] = tokenMatch;

            const decodedToken = this.jwt.verify(
                token,
                envConfig.jwt.secret
            ) as User;

            const verifiedUser = await this.userRepository.findById(
                decodedToken.id,
                {
                    where: { deletedAt: null },
                    select: { ...USER.SELECTABLE_FIELDS, role: true }
                }
            );

            if (!verifiedUser) {
                return null;
            }

            return {
                loggedUser: verifiedUser,
                refreshedToken: this.sign(verifiedUser) || ''
            };
        } catch (error) {
            return null;
        }
    }
}

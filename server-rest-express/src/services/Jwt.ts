import { Op } from 'sequelize';
import { inject, injectable } from 'inversify';

import type {
    IJwt,
    User,
    JsonWebToken,
    EnvConfigJwt,
    IUserRepository
} from '@/types';

@injectable()
export class Jwt implements IJwt {
    constructor(
        @inject('%jsonwebtoken') public jwt: JsonWebToken,

        @inject('repositories.user') public userRepository: IUserRepository,

        @inject('%config.jwt%') public jwtConfig: EnvConfigJwt
    ) {
        const { secret, expiresIn } = jwtConfig;

        this.jwt = jwt;
        this.jwtSecret = secret;
        this.jwtExpiresIn = expiresIn;
    }

    jwtSecret: string;

    jwtExpiresIn: number;

    sign(user: User): string | null {
        const token = this.jwt.sign(user.dataValues, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn
        });

        return `Bearer ${token}`;
    }

    async verify(
        authHeader: string
    ): Promise<{ refreshedToken: string; loggedUser: User } | null> {
        try {
            const tokenMatch = /Bearer (\S+)/g.exec(authHeader);

            if (!tokenMatch || tokenMatch.length < 1) {
                return null;
            }

            const [, token] = tokenMatch;

            const decodedToken = this.jwt.verify(token, this.jwtSecret) as User;

            const verifiedUser = await this.userRepository.findById(
                decodedToken.id,
                {
                    include: [{ association: 'role' }],
                    where: {
                        deletedAt: {
                            [Op.eq]: null
                        }
                    }
                }
            );

            if (!verifiedUser) {
                return null;
            }

            return {
                loggedUser: verifiedUser,
                refreshedToken: this.sign(verifiedUser)
            };
        } catch (error) {
            return null;
        }
    }
}

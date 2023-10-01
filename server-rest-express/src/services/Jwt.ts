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
    ): Promise<{ refreshedToken: string; role: string } | null> {
        try {
            const [token] = authHeader.match(/Bearer (\S+)/g);

            if (!token) {
                return null;
            }

            const decodedToken = this.jwt.verify(token, this.jwtSecret) as User;

            const verifiedUser = await this.userRepository.findByEmail(
                decodedToken.email
            );

            if (!verifiedUser) {
                return null;
            }

            const {
                role: { name: verifiedUserRole }
            } = verifiedUser;

            return {
                refreshedToken: this.sign(verifiedUser),
                role: verifiedUserRole
            };
        } catch (error) {
            return null;
        }
    }
}

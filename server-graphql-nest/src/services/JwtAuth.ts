import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { UserRepository } from '@/repositories/User';

import type { User } from '@/graphql';

@Injectable()
export class JwtAuthService {
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository
    ) {}

    jwtSecret: string;

    async sign(user: User) {
        const token = await this.jwtService.signAsync(
            JSON.parse(JSON.stringify(user))
        );

        return `Bearer ${token}`;
    }

    async verify(authHeader: string) {
        try {
            const tokenMatch = /Bearer (\S+)/g.exec(authHeader);

            if (!tokenMatch || tokenMatch.length < 1) {
                return null;
            }

            const [, token] = tokenMatch;

            const decodedToken = await this.jwtService.verifyAsync(token);
            const verifiedUser = await this.userRepository.findById(
                decodedToken.id,
                { relations: { role: true } }
            );

            if (!verifiedUser) {
                return null;
            }

            return {
                loggedUser: verifiedUser,
                refreshedToken: await this.sign(verifiedUser)
            };
        } catch (error) {
            return null;
        }
    }
}

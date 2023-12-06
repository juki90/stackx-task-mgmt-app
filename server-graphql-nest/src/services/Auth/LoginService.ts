import * as bcrypt from 'bcryptjs';
import {
    Inject,
    Injectable,
    forwardRef,
    UnauthorizedException
} from '@nestjs/common';

import { en as messages } from '@/locales';
import { JwtAuthService } from '@/services/JwtAuth';
import { LoginInputDto } from '@/dto/Auth/LoginDto';
import { UserRepository } from '@/repositories/User';

import type { User } from '@/graphql';
import type { Response } from 'express';

@Injectable()
export class LoginService {
    constructor(
        @Inject(forwardRef(() => UserRepository))
        private userRepository: UserRepository,
        private jwtAuth: JwtAuthService
    ) {}

    async login(loginInput: LoginInputDto, res: Response): Promise<User> {
        const { email, password } = loginInput;

        const userToCheck = await this.userRepository.findByEmail(email, {
            select: { password: true },
            where: { deletedAt: null }
        });

        if (!userToCheck) {
            throw new UnauthorizedException({
                message: messages.validators.auth.incorrectEmailOrPassword
            });
        }
        const isValid = await bcrypt.compare(password, userToCheck.password);

        if (!isValid) {
            throw new UnauthorizedException({
                message: messages.validators.auth.incorrectEmailOrPassword
            });
        }

        const userToSend = await this.userRepository.findByEmail(email, {
            relations: { role: true, createdBy: true }
        });
        const authHeader = await this.jwtAuth.sign(userToSend);

        res.setHeader('Access-Control-Expose-Headers', 'X-Auth-Token');
        res.setHeader('X-Auth-Token', authHeader);

        return userToSend;
    }
}

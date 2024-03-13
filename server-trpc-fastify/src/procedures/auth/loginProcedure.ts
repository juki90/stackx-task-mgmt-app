import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';

import { USER } from '~/config/constants';
import { en as messages } from '~/locales';
import { publicProcedure } from '~/router/trpc';
import { loginValidation } from '~/validations/auth';

import type { IJwt, User, IUserRepository } from '~/types';

export const loginProcedure = publicProcedure
    .input(loginValidation)
    .mutation(async opts => {
        const {
            ctx: { res, di },
            input: { email, password }
        } = opts;

        const userRepository = di.get<IUserRepository>('repositories.user');
        const jwtService = di.get<IJwt>('services.jwt');

        const userToCheck = await userRepository.findByEmail(email, {
            where: { deletedAt: null },
            select: { password: true }
        });

        if (!userToCheck) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: messages.validators.auth.incorrectEmailOrPassword
            });
        }

        const isValid = await bcrypt.compare(password, userToCheck.password);

        if (!isValid) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: messages.validators.auth.incorrectEmailOrPassword
            });
        }

        const userToSend = await userRepository.findByEmail(email, {
            where: { deletedAt: null },
            select: { ...USER.SELECTABLE_FIELDS, role: true }
        });

        const authHeader = jwtService.sign(userToSend as User);

        res.header('X-Auth-Token', authHeader);

        return userToSend;
    });

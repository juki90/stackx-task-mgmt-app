import { TRPCError } from '@trpc/server';

import { publicProcedure } from '~/router/trpc';
import { sharedShowValidation } from '~/validations/shared';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { IUserRepository } from '~/types';

export const showUserProcedure = publicProcedure
    .input(sharedShowValidation)
    .use(checkAdminRoleMiddleware)
    .query(async opts => {
        const {
            ctx: { di },
            input: { id }
        } = opts;

        const userRepository = di.get<IUserRepository>('repositories.user');

        const user = await userRepository.findById(id, {
            where: { deletedAt: null },
            include: {
                role: true,
                tasks: true
            }
        });

        if (!user) {
            throw new TRPCError({
                code: 'NOT_FOUND'
            });
        }

        return user;
    });

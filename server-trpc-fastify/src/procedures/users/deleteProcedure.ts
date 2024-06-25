import { TRPCError } from '@trpc/server';

import { ROLE } from '~/config/constants';
import { en as messages } from '~/locales';
import { publicProcedure } from '~/router/trpc';
import { sharedDeleteValidation } from '~/validations/shared';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { IUserRepository } from '~/types';

export const deleteUserProcedure = publicProcedure
    .input(sharedDeleteValidation)
    .use(checkAdminRoleMiddleware)
    .mutation(async opts => {
        const {
            input: { id },
            ctx: { di, loggedUser }
        } = opts;

        const userRepository = di.get<IUserRepository>('repositories.user');

        const userToDelete = await userRepository.findById(id, {
            where: { deletedAt: null },
            select: { role: true }
        });

        if (!userToDelete) {
            return null;
        }

        if (
            loggedUser.createdById &&
            userToDelete.role?.name === ROLE.NAMES.ADMIN
        ) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: messages.validators.users.notDeletableUserByYou
            });
        }

        if (loggedUser.id === id) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: messages.validators.users.unableToDeleteYourself
            });
        }

        await userRepository.update({
            data: { deletedAt: new Date() },
            where: { id }
        });

        return null;
    });

import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { TRPCError } from '@trpc/server';

import { en as messages } from '~/locales';
import { ROLE, USER } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { userUpdateValidation } from '~/validations/users';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { TPrisma, IRoleRepository, IUserRepository } from '~/types';

export const updateUserProcedure = publicProcedure
    .input(userUpdateValidation)
    .use(checkAdminRoleMiddleware)
    .mutation(async opts => {
        const {
            input: { isAdmin, ...input },
            ctx: { di, loggedUser }
        } = opts;

        const prisma = di.get<TPrisma>('%prisma');
        const userRepository = di.get<IUserRepository>('repositories.user');
        const roleRepository = di.get<IRoleRepository>('repositories.role');

        const userToUpdate = await userRepository.findById(input.id, {
            where: { deletedAt: null },
            select: { ...USER.SELECTABLE_FIELDS, role: true }
        });

        if (!userToUpdate) {
            throw new TRPCError({
                code: 'NOT_FOUND'
            });
        }

        const existingUserWithEmail = await userRepository.findOne({
            where: { email: input.email, id: { not: input.id } }
        });

        if (existingUserWithEmail) {
            throw new ZodError([
                {
                    code: 'custom',
                    path: ['email'],
                    message: messages.validators.users.userWithThisEmailExists
                }
            ]);
        }

        const [loggedUserCreatedBy, adminRole, userRole] =
            await prisma.$transaction([
                userRepository.findById(loggedUser.createdById || '', {
                    where: {}
                }) as any,
                roleRepository.findOne({
                    where: { name: ROLE.NAMES.ADMIN },
                    select: {
                        id: true
                    }
                }) as any,
                roleRepository.findOne({
                    where: { name: ROLE.NAMES.USER },
                    select: {
                        id: true
                    }
                }) as any
            ]);

        if (
            loggedUserCreatedBy &&
            userToUpdate?.role?.name === ROLE.NAMES.ADMIN
        ) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: messages.validators.users.notUpdatableUserByYou
            });
        }

        if (loggedUserCreatedBy && isAdmin) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: messages.validators.users.cantAssignUserAdminRole
            });
        }

        if (
            !loggedUserCreatedBy &&
            !isAdmin &&
            loggedUser.id === userToUpdate.id
        ) {
            throw new TRPCError({
                code: 'FORBIDDEN',
                message: messages.validators.users.cantRemoveAdminRole
            });
        }

        if (input.password) {
            input.password = bcrypt.hashSync(input.password, 12);
        }

        if (typeof input.password === 'string' && !input.password) {
            delete input.password;
        }

        await prisma.user.update({
            data: {
                ...input,
                role: {
                    connect: { id: isAdmin ? adminRole!.id : userRole!.id }
                }
            },
            where: { id: userToUpdate.id }
        });

        const userToSend = await prisma.user.findUnique({
            where: { id: userToUpdate.id },
            select: { ...USER.SELECTABLE_FIELDS, role: true, createdBy: true }
        });

        return userToSend;
    });

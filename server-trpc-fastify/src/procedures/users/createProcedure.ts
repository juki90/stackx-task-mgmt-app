import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { TRPCError } from '@trpc/server';

import { en as messages } from '~/locales';
import { ROLE, USER } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { userCreateValidation } from '~/validations/users';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { TPrisma, IUserRepository, IRoleRepository } from '~/types';

export const createUserProcedure = publicProcedure
    .input(userCreateValidation)
    .use(checkAdminRoleMiddleware)
    .mutation(async opts => {
        const {
            input: { isAdmin, ...input },
            ctx: { di, loggedUser }
        } = opts;

        const prisma = di.get<TPrisma>('%prisma');
        const userRepository = di.get<IUserRepository>('repositories.user');
        const roleRepository = di.get<IRoleRepository>('repositories.role');

        const existingUserWithEmail = await userRepository.findByEmail(
            input.email
        );

        if (existingUserWithEmail) {
            throw new ZodError([
                {
                    code: 'custom',
                    path: ['email'],
                    message: messages.validators.users.userWithThisEmailExists
                }
            ]);
        }

        if (loggedUser.createdById && isAdmin) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: messages.validators.users.youCantCreateAdmin
            });
        }

        const [adminRole, userRole] = await prisma.$transaction([
            roleRepository.findOne({
                where: { name: ROLE.NAMES.ADMIN },
                select: { id: true }
            }) as any,
            roleRepository.findOne({
                where: { name: ROLE.NAMES.USER },
                select: { id: true }
            }) as any
        ]);

        input.password = bcrypt.hashSync(input.password, 12);

        const createdUser = await userRepository.create({
            data: {
                ...input,
                role: {
                    connect: {
                        id: isAdmin ? adminRole!.id : userRole!.id
                    }
                },
                createdBy: {
                    connect: {
                        id: loggedUser.id
                    }
                }
            },
            select: USER.SELECTABLE_FIELDS
        });

        if (createdUser.password) {
            return userRepository.findById(createdUser.id, {
                select: USER.SELECTABLE_FIELDS
            });
        }

        return createdUser;
    });

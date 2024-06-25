import { USER } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { sharedFetchValidation } from '~/validations/shared';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { TPrisma, IUserRepository, User } from '~/types';

export const fetchUsersProcedure = publicProcedure
    .input(sharedFetchValidation)
    .use(checkAdminRoleMiddleware)
    .query(async opts => {
        const {
            ctx: { di },
            input: { page, filter }
        } = opts;

        const prisma = di.get<TPrisma>('%prisma');
        const userRepository = di.get<IUserRepository>('repositories.user');

        const where: {
            OR?: { [x: string]: { contains: string } }[];
            deletedAt: null;
        } = { deletedAt: null };

        const pagination = {
            take: page.size,
            skip: page.size * page.index
        };

        if (filter) {
            where.OR = [
                { firstName: { contains: filter } },
                { lastName: { contains: filter } },
                { email: { contains: filter } }
            ];
        }

        const [users, count] = await prisma.$transaction([
            userRepository.findMany({
                ...pagination,
                where,
                select: USER.SELECTABLE_FIELDS,
                orderBy: [{ updatedAt: 'desc' }]
            }) as Promise<User[]>,
            userRepository.count({
                where
            }) as any
        ]);

        return { rows: users, count };
    });

import { USER } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { checkJwtMiddleware } from '~/middleware/checkJwt';

import type { IUserRepository } from '~/types';

export const meProcedure = publicProcedure
    .use(checkJwtMiddleware)
    .query(async opts => {
        const {
            ctx: { di, loggedUser }
        } = opts;

        const userRepository = di.get<IUserRepository>('repositories.user');

        const me = await userRepository.findById(loggedUser.id, {
            where: { deletedAt: null },
            select: {
                ...USER.SELECTABLE_FIELDS,
                role: true,
                createdBy: true,
                tasks: { orderBy: { updatedAt: 'desc' } }
            }
        });

        return me;
    });

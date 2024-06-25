import { TRPCError } from '@trpc/server';

import { USER } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { sharedShowValidation } from '~/validations/shared';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { ITaskRepository } from '~/types';

export const showTaskProcedure = publicProcedure
    .input(sharedShowValidation)
    .use(checkAdminRoleMiddleware)
    .query(async opts => {
        const {
            ctx: { di },
            input: { id }
        } = opts;

        const taskRepository = di.get<ITaskRepository>('repositories.task');

        const task = await taskRepository.findById(id, {
            include: {
                createdBy: { select: USER.SELECTABLE_FIELDS },
                updatedBy: { select: USER.SELECTABLE_FIELDS },
                users: { select: USER.SELECTABLE_FIELDS }
            }
        });

        if (!task) {
            throw new TRPCError({
                code: 'NOT_FOUND'
            });
        }

        return task;
    });

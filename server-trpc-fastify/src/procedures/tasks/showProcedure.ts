import { TRPCError } from '@trpc/server';

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
                createdBy: true,
                updatedBy: true,
                users: true
            }
        });

        if (!task) {
            throw new TRPCError({
                code: 'NOT_FOUND'
            });
        }

        return task;
    });

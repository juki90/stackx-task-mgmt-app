import { publicProcedure } from '~/router/trpc';
import { taskDeleteValidation } from '~/validations/tasks';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { ITaskRepository } from '~/types';

export const deleteTaskProcedure = publicProcedure
    .input(taskDeleteValidation)
    .use(checkAdminRoleMiddleware)
    .mutation(async opts => {
        const {
            ctx: { di },
            input: { id }
        } = opts;

        const taskRepository = di.get<ITaskRepository>('repositories.task');

        const task = await taskRepository.findById(id);

        if (!task) {
            return null;
        }

        await taskRepository.delete({ where: { id } });

        return null;
    });

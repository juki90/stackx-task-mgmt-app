import { publicProcedure } from '~/router/trpc';
import { sharedFetchValidation } from '~/validations/shared';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { Task, TPrisma, ITaskRepository } from '~/types';

export const fetchTasksProcedure = publicProcedure
    .input(sharedFetchValidation)
    .use(checkAdminRoleMiddleware)
    .query(async opts => {
        const {
            ctx: { di },
            input: { page, filter }
        } = opts;

        const prisma = di.get<TPrisma>('%prisma');
        const taskRepository = di.get<ITaskRepository>('repositories.task');

        const where: {
            OR?: { [x: string]: { contains: string } }[];
        } = {};

        const pagination = {
            take: page.size,
            skip: page.size * page.index
        };

        if (filter) {
            where.OR = [
                { title: { contains: filter } },
                { description: { contains: filter } }
            ];
        }

        const [tasks, count] = await prisma.$transaction([
            taskRepository.findMany({
                ...pagination,
                where,
                orderBy: [{ updatedAt: 'desc' }]
            }) as Promise<Task[]>,
            taskRepository.count({
                where
            }) as any
        ]);

        return { rows: tasks, count };
    });

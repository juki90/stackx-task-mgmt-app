import { ZodError } from 'zod';

import { en as messages } from '~/locales';
import { USER } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { taskCreateValidation } from '~/validations/tasks';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type { ITaskRepository, IUserRepository } from '~/types';

export const createTaskProcedure = publicProcedure
    .input(taskCreateValidation)
    .use(checkAdminRoleMiddleware)
    .mutation(async opts => {
        const {
            input,
            ctx: { di, loggedUser }
        } = opts;

        const taskRepository = di.get<ITaskRepository>('repositories.task');
        const userRepository = di.get<IUserRepository>('repositories.user');

        input.userIds = Array.from(new Set(input.userIds));

        const { userIds: taskPayloadUserIds } = input;
        const usersStatusOfNewTask = taskPayloadUserIds.map(userId => ({
            userId
        }));
        const users = await userRepository.findMany({
            where: {
                id: {
                    in: taskPayloadUserIds
                },
                deletedAt: null
            },
            select: USER.SELECTABLE_FIELDS
        });

        if (users.length !== taskPayloadUserIds.length) {
            throw new ZodError([
                {
                    code: 'custom',
                    path: ['userIds'],
                    message: messages.validators.tasks.notAllUsersFromArrayExist
                }
            ]);
        }

        return taskRepository.create({
            data: {
                title: input.title,
                description: input.description,
                status: 0,
                usersStatus: usersStatusOfNewTask,
                createdBy: { connect: { id: loggedUser.id } },
                users: {
                    connect: users.map(({ id }) => ({ id }))
                }
            }
        });
    });

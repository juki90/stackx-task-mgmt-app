import { ZodError } from 'zod';
import { TRPCError } from '@trpc/server';

import { TASK } from '~/config/constants';
import { en as messages } from '~/locales';
import { publicProcedure } from '~/router/trpc';
import { taskUpdateValidation } from '~/validations/tasks';
import { checkAdminRoleMiddleware } from '~/middleware/checkAdminRole';

import type {
    ITaskRepository,
    IUserRepository,
    TaskUsersStatus
} from '~/types';

export const updateTaskProcedure = publicProcedure
    .input(taskUpdateValidation)
    .use(checkAdminRoleMiddleware)
    .mutation(async opts => {
        const {
            input,
            input: { id: inputTaskId },
            ctx: { di, loggedUser }
        } = opts;

        const taskRepository = di.get<ITaskRepository>('repositories.task');
        const userRepository = di.get<IUserRepository>('repositories.user');

        const existingTask = await taskRepository.findById(inputTaskId);

        if (!existingTask) {
            throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const { usersStatus: existingTaskUsersStatus } = existingTask;

        input.userIds = Array.from(new Set(input.userIds));

        const { userIds: taskPayloadUserIds } = input;

        const isTaskPayloadAndExistingTaskUserIdsSame =
            (existingTaskUsersStatus as TaskUsersStatus).length ===
                taskPayloadUserIds.length &&
            (existingTaskUsersStatus as TaskUsersStatus).every(
                ({ userId }: { userId: string }) =>
                    taskPayloadUserIds.includes(userId)
            );
        let newOrSameTaskUsersStatus =
            existingTaskUsersStatus as TaskUsersStatus;

        if (
            isTaskPayloadAndExistingTaskUserIdsSame &&
            existingTask.status !== TASK.STATUS.PENDING
        ) {
            return taskRepository.update({
                data: {
                    title: input.title,
                    description: input.description,
                    usersStatus: newOrSameTaskUsersStatus,
                    updatedBy: { connect: { id: loggedUser.id } }
                },
                where: {
                    id: inputTaskId
                }
            });
        }

        if (
            !isTaskPayloadAndExistingTaskUserIdsSame &&
            existingTask.status !== TASK.STATUS.PENDING
        ) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message:
                    messages.validators.tasks.onlyPendingTaskCanReassingUsers
            });
        }

        if (!isTaskPayloadAndExistingTaskUserIdsSame) {
            newOrSameTaskUsersStatus = [];

            taskPayloadUserIds.forEach((userId: string) => {
                const existingTaskUsersStatusItem = (
                    existingTaskUsersStatus as TaskUsersStatus
                ).find(
                    ({ userId: existingUserId }) => userId === existingUserId
                );

                if (existingTaskUsersStatusItem) {
                    newOrSameTaskUsersStatus.push(existingTaskUsersStatusItem);

                    return;
                }

                newOrSameTaskUsersStatus.push({ userId, doneAt: null });
            });
        }

        const newOrSameUserIds = newOrSameTaskUsersStatus.map(
            ({ userId }) => userId
        );
        const users = await userRepository.findMany({
            where: {
                id: { in: newOrSameUserIds },
                deletedAt: null
            }
        });

        if (users.length !== taskPayloadUserIds.length) {
            throw new ZodError([
                {
                    code: 'custom',
                    path: ['general'],
                    message: messages.validators.tasks.notAllUsersFromArrayExist
                }
            ]);
        }

        return taskRepository.update({
            data: {
                title: input.title,
                description: input.description,
                usersStatus: newOrSameTaskUsersStatus,
                updatedBy: { connect: { id: loggedUser.id } },
                users: {
                    connect: users.map(({ id }) => ({ id }))
                }
            },
            where: {
                id: inputTaskId
            }
        });
    });

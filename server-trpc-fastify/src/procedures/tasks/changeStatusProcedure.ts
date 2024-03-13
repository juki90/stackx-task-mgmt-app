import { TRPCError } from '@trpc/server';

import { en as messages } from '~/locales';
import { ROLE, TASK } from '~/config/constants';
import { publicProcedure } from '~/router/trpc';
import { checkJwtMiddleware } from '~/middleware/checkJwt';
import { taskChangeStatusValidation } from '~/validations/tasks';

import type { ITaskRepository, TaskUsersStatus } from '~/types';

export const changeTaskStatusProcedure = publicProcedure
    .input(taskChangeStatusValidation)
    .use(checkJwtMiddleware)
    .mutation(async opts => {
        const {
            input: { id, status },
            ctx: { di, loggedUser }
        } = opts;

        const taskRepository = di.get<ITaskRepository>('repositories.task');

        const task = await taskRepository.findById(id);

        if (!task) {
            throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const { status: taskStatus, usersStatus } = task;

        if (taskStatus === TASK.STATUS.PENDING && status === TASK.STATUS.DONE) {
            const userIndex = (usersStatus as TaskUsersStatus).findIndex(
                ({ userId }) => userId === loggedUser.id
            );

            if (userIndex < 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: messages.validators.tasks.youDontBelongToThisTask
                });
            }

            if ((usersStatus as TaskUsersStatus)[userIndex].doneAt) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: messages.validators.tasks.alreadyDone
                });
            }

            (task.usersStatus as TaskUsersStatus)[userIndex].doneAt =
                new Date();

            if (
                (usersStatus as TaskUsersStatus).every(({ doneAt }) => doneAt)
            ) {
                return taskRepository.update({
                    where: { id },
                    data: {
                        status: TASK.STATUS.DONE,
                        usersStatus: task.usersStatus
                    }
                });
            }
        }

        const isLoggedUserAdmin = loggedUser.role?.name === ROLE.NAMES.ADMIN;

        if (!isLoggedUserAdmin && status === TASK.STATUS.CANCELLED) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: messages.validators.tasks.onlyAdminCanCancelTask
            });
        }

        if (
            isLoggedUserAdmin &&
            status === TASK.STATUS.CANCELLED &&
            taskStatus === TASK.STATUS.PENDING
        ) {
            return taskRepository.update({
                data: { status: TASK.STATUS.CANCELLED },
                where: { id }
            });
        }

        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: messages.validators.tasks.unsupportedStatusChange
        });
    });

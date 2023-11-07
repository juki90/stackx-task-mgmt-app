import { UserInputError } from 'apollo-server-express';
import { Injectable } from '@nestjs/common';

import { en as messages } from '@/locales';
import { ROLE_NAMES } from '@/entities/Role';
import { TASK_STATUSES } from '@/entities/Task';
import { TaskRepository } from '@/repositories/Task';
import { ChangeTaskStatusInputDto } from '@/dto/Task/ChangeStatusDto';

import type { Task, User } from '@/graphql';

@Injectable()
export class TaskChangeStatusService {
    constructor(private taskRepository: TaskRepository) {}

    async changeStatus(
        id: string,
        { status }: ChangeTaskStatusInputDto,
        loggedUser: User
    ): Promise<Task> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new UserInputError(messages.notFound);
        }

        const { status: taskStatus, usersStatus } = task;

        if (
            taskStatus === TASK_STATUSES.PENDING &&
            status === TASK_STATUSES.DONE
        ) {
            const userIndex = usersStatus.findIndex(
                ({ userId }) => userId === loggedUser.id
            );

            if (userIndex < 0) {
                throw new UserInputError(
                    messages.validators.tasks.youDontBelongToThisTask
                );
            }

            if (usersStatus[userIndex].doneAt) {
                throw new UserInputError(messages.validators.tasks.alreadyDone);
            }

            task.usersStatus[userIndex].doneAt = new Date();

            let isTaskDone: boolean;

            if (usersStatus.every(({ doneAt }) => doneAt)) {
                isTaskDone = true;
            }

            return this.taskRepository.update(id, {
                usersStatus: task.usersStatus,
                status: isTaskDone ? 1 : 0
            });
        }

        const isLoggedUserAdmin = loggedUser?.role?.name === ROLE_NAMES.ADMIN;

        if (!isLoggedUserAdmin && status === TASK_STATUSES.CANCELLED) {
            throw new UserInputError(
                messages.validators.tasks.onlyAdminCanCancelTask
            );
        }

        if (
            isLoggedUserAdmin &&
            status === TASK_STATUSES.CANCELLED &&
            taskStatus === TASK_STATUSES.PENDING
        ) {
            return this.taskRepository.update(id, {
                status: TASK_STATUSES.CANCELLED
            });
        }

        throw new UserInputError(
            messages.validators.tasks.unsupportedStatusChange
        );
    }
}

import { In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { en as messages } from '@/locales';
import { TaskRepository } from '@/repositories/Task';
import { UserRepository } from '@/repositories/User';
import { CreateTaskInputDto } from '@/dto/Task/CreateDto';

import type { Task, User } from '@/graphql';
import { TASK_STATUSES } from '@/entities/Task';

@Injectable()
export class TasksUpdateService {
    constructor(
        private taskRepository: TaskRepository,
        private userRepository: UserRepository
    ) {}

    async update(
        id: string,
        updateTaskInput: CreateTaskInputDto,
        loggedUser: User
    ): Promise<Task> {
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw new UserInputError(messages.notFound);
        }

        const { usersStatus: existingTaskUsersStatus } = existingTask;

        updateTaskInput.userIds = Array.from(new Set(updateTaskInput.userIds));

        const { userIds: updateTaskInputUserIds } = updateTaskInput;

        const areUserIdListsTheSame =
            existingTaskUsersStatus.length === updateTaskInputUserIds.length &&
            existingTaskUsersStatus.every(({ userId }: { userId: string }) =>
                updateTaskInputUserIds.includes(userId)
            );

        let newOrSameTaskUsersStatus = existingTaskUsersStatus;

        if (
            areUserIdListsTheSame &&
            [TASK_STATUSES.DONE, TASK_STATUSES.CANCELLED].includes(
                existingTask.status
            )
        ) {
            return this.taskRepository.update(id, {
                title: updateTaskInput.title,
                description: updateTaskInput.description,
                usersStatus: newOrSameTaskUsersStatus,
                updatedBy: loggedUser
            });
        }

        if (
            !areUserIdListsTheSame &&
            [TASK_STATUSES.DONE, TASK_STATUSES.CANCELLED].includes(
                existingTask.status
            )
        ) {
            throw new UserInputError(
                messages.validators.tasks.onlyPendingTaskCanReassingUsers,
                { field: 'general' }
            );
        }

        if (!areUserIdListsTheSame) {
            newOrSameTaskUsersStatus = [];

            updateTaskInputUserIds.forEach((userId: string) => {
                const existingTaskUsersStatusItem =
                    existingTaskUsersStatus.find(
                        ({ userId: existingUserId }) =>
                            userId === existingUserId
                    );

                if (existingTaskUsersStatusItem) {
                    newOrSameTaskUsersStatus.push(existingTaskUsersStatusItem);

                    return;
                }

                newOrSameTaskUsersStatus.push({ userId });
            });
        }

        const newOrSameUserIds = newOrSameTaskUsersStatus.map(
            ({ userId }) => userId
        );
        const users = await this.userRepository.findAll({
            where: { id: In(newOrSameUserIds) }
        });

        if (users.length !== updateTaskInputUserIds.length) {
            const userIds = users.map(({ id }) => id);
            const missingUserIds = updateTaskInputUserIds.filter(
                (userId: string) => !userIds.includes(userId)
            );

            throw new UserInputError(
                messages.validators.tasks.notAllUsersFromArrayExist,
                { field: 'general', data: missingUserIds }
            );
        }

        return this.taskRepository.update(id, {
            title: updateTaskInput.title,
            description: updateTaskInput.description,
            usersStatus: newOrSameTaskUsersStatus,
            users,
            updatedBy: loggedUser
        });
    }
}

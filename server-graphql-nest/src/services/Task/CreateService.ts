import { In } from 'typeorm';
import { UserInputError } from 'apollo-server-express';
import { Inject, forwardRef, Injectable } from '@nestjs/common';

import { en as messages } from '@/locales';
import { TaskRepository } from '@/repositories/Task';
import { UserRepository } from '@/repositories/User';
import { CreateTaskInputDto } from '@/dto/Task/CreateDto';

import type { Task, User } from '@/graphql';

@Injectable()
export class TasksCreateService {
    constructor(
        private taskRepository: TaskRepository,

        @Inject(forwardRef(() => UserRepository))
        private userRepository: UserRepository
    ) {}

    async create(
        createTaskInput: CreateTaskInputDto,
        loggedUser: User
    ): Promise<Task> {
        createTaskInput.userIds = Array.from(new Set(createTaskInput.userIds));

        const { userIds: taskPayloadUserIds } = createTaskInput;

        const usersStatus = taskPayloadUserIds.map((userId: string) => ({
            userId
        }));
        const users = await this.userRepository.findAll({
            where: { id: In(taskPayloadUserIds) }
        });

        if (users.length !== taskPayloadUserIds.length) {
            const userIds = users.map(({ id }) => id);
            const missingUserIds = taskPayloadUserIds.filter(
                (userId: string) => !userIds.includes(userId)
            );

            throw new UserInputError(
                messages.validators.tasks.notAllUsersFromArrayExist,
                { field: 'general', data: missingUserIds }
            );
        }

        return this.taskRepository.create({
            title: createTaskInput.title,
            description: createTaskInput.description,
            status: 0,
            usersStatus,
            createdBy: loggedUser,
            users
        });
    }
}

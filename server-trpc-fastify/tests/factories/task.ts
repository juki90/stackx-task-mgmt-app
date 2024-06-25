import { faker } from '@faker-js/faker';

import { ROLE } from '~/config/constants';

import initDi from '~/di';

import type { Task, User, ITaskRepository, IUserRepository } from '~/types';

class TaskFactory {
    static async generate(
        props: Partial<Task & { userIds?: string[] }> = {}
    ): Promise<Partial<Task & { userIds?: string[] }>> {
        let userFromDB: User | undefined;
        const di = await initDi();
        const userRepository = di.get<IUserRepository>('repositories.user');

        if (!props.userIds) {
            userFromDB = (await userRepository.findOne({
                where: {
                    role: {
                        name: ROLE.NAMES.USER
                    }
                }
            })) as User;
        }

        const defaultProps = {
            title: faker.lorem.sentence(5),
            description: faker.lorem.sentence({ min: 10, max: 50 }),
            userIds: props.userIds
        } as Partial<Task & { userIds?: string[] }>;

        if (userFromDB) {
            defaultProps.userIds = props.userIds
                ? props.userIds
                : [userFromDB?.id];
        }

        return {
            ...defaultProps,
            ...props
        };
    }

    static async create(
        creatorEmail: string,
        props: Partial<Task & { userIds?: string[] }> = {}
    ): Promise<Task> {
        const di = await initDi();
        const userRepository = di.get<IUserRepository>('repositories.user');
        const taskRepository = di.get<ITaskRepository>('repositories.task');
        const creator = (await userRepository.findByEmail(
            creatorEmail
        )) as User;
        const generatedTask = await this.generate(props);

        generatedTask.usersStatus =
            props.usersStatus ||
            generatedTask?.userIds?.map(userId => ({
                userId,
                doneAt: null
            }));
        generatedTask.status = props.status || 0;

        const { userIds, ...generatedTaskWithoutUserIds } = generatedTask;

        return taskRepository.create({
            data: {
                ...generatedTaskWithoutUserIds,
                users: {
                    connect: (userIds as string[]).map(id => ({ id }))
                },
                createdBy: {
                    connect: { id: creator.id }
                }
            }
        });
    }
}

export default TaskFactory;

import { faker } from '@faker-js/faker';
import { In, DeepPartial } from 'typeorm';

import type { Task } from '@/entities/Task';

class TaskFactory {
    static async generate(
        props: DeepPartial<Task> & { userIds?: string[] } = {}
    ) {
        const user = await userRepository.findByEmail('user@example.test');

        const defaultProps = {
            title: faker.lorem.sentence(5),
            description: faker.lorem.sentence({ min: 10, max: 50 }),
            userIds: [user.id]
        };

        return {
            ...defaultProps,
            ...props
        };
    }

    static async create(
        props: DeepPartial<Task> & { userIds?: string[] } = {}
    ) {
        const admin = await userRepository.findByEmail('admin@example.test');
        const generatedTask = await this.generate(props);

        generatedTask.usersStatus = generatedTask.userIds.map(userId => ({
            userId
        }));
        generatedTask.status = 0;

        const users = await userRepository.findAll({
            where: { id: In(generatedTask.userIds) }
        });

        delete generatedTask.userIds;

        return taskRepository.create({
            ...generatedTask,
            users,
            createdBy: admin
        });
    }
}

export default TaskFactory;

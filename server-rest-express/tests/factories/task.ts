import { Op } from 'sequelize';
import { faker } from '@faker-js/faker';

import type { Task } from '@/types';
import type { MakeNullishOptional } from 'sequelize/types/utils';

class TaskFactory {
    static async generate(
        props: MakeNullishOptional<Task> & { userIds?: string[] } = {}
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
        props: MakeNullishOptional<Task> & { userIds?: string[] } = {}
    ) {
        const admin = await userRepository.findByEmail('admin@example.test');
        const generatedTask = await this.generate(props);

        generatedTask.usersStatus = generatedTask.userIds.map(userId => ({
            userId
        }));
        generatedTask.status = 0;

        const task = await taskRepository.create(generatedTask);
        const createdTaskUserIds = task.usersStatus.map(({ userId }) => userId);
        const users = await userRepository.findAll({
            where: { id: { [Op.in]: createdTaskUserIds } }
        });

        await Promise.all([task.setUsers(users), task.setCreatedBy(admin)]);

        return task;
    }
}

export default TaskFactory;

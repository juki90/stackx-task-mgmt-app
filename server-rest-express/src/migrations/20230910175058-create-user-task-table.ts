import Sequelize from 'sequelize';

import type { Migration } from '@/migrations';
import type { QueryInterface } from 'sequelize';

export const up: Migration = ({
    context: queryInterface
}: {
    context: QueryInterface;
}) =>
    queryInterface.createTable(
        'UserTasks',
        {
            userId: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'cascade'
            },
            taskId: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                references: {
                    model: 'Tasks',
                    key: 'id'
                },
                onDelete: 'cascade'
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        },
        {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    );

export const down = ({
    context: queryInterface
}: {
    context: QueryInterface;
}) => queryInterface.dropTable('UserTasks');

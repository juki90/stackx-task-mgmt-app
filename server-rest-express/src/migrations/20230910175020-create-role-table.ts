import Sequelize from 'sequelize';

import type { Migration } from '@/migrations';
import type { QueryInterface } from 'sequelize';

export const up: Migration = ({
    context: queryInterface
}: {
    context: QueryInterface;
}) =>
    queryInterface.createTable(
        'Roles',
        {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
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
}) => queryInterface.dropTable('Roles');

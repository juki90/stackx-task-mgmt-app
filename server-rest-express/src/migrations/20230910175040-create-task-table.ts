import Sequelize from 'sequelize';

import type { Migration } from '@/migrations';
import type { QueryInterface } from 'sequelize';

export const up: Migration = ({
    context: queryInterface
}: {
    context: QueryInterface;
}) =>
    queryInterface.createTable(
        'Tasks',
        {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    min: 2,
                    max: 128
                }
            },
            description: {
                type: Sequelize.TEXT,
                validate: {
                    max: 3000
                }
            },
            createdById: {
                type: Sequelize.UUID,
                allowNull: true,
                validate: {
                    notEmpty: true,
                    isUUID: 4
                },
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            updatedById: {
                type: Sequelize.UUID,
                validate: {
                    isUUID: 4
                },
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            usersStatus: {
                type: Sequelize.JSONB,
                defaultValue: []
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                validate: {
                    notEmpty: true,
                    isIn: [[-1, 0, 1]]
                }
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
}) => queryInterface.dropTable('Tasks');

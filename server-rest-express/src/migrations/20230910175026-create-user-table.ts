import Sequelize from 'sequelize';

import type { Migration } from '@/migrations';
import type { QueryInterface } from 'sequelize';

export const up: Migration = ({
    context: queryInterface
}: {
    context: QueryInterface;
}) =>
    queryInterface.createTable(
        'Users',
        {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    min: 2,
                    max: 32
                }
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    min: 2,
                    max: 32
                }
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    isEmail: true
                }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    min: 8,
                    max: 64
                }
            },
            createdById: {
                type: Sequelize.UUID,
                validate: {
                    isUUID: 4
                },
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            roleId: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                references: {
                    model: 'Roles',
                    key: 'id'
                }
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
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
}) => queryInterface.dropTable('Users');

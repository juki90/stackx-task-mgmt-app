import { v4 as uuidv4 } from 'uuid';

import { ROLE_NAMES } from '@/models/Role';

import type { Migration } from '@/seeders';
import type { QueryInterface } from 'sequelize';

export const up: Migration = async ({
    context: queryInterface
}: {
    context: QueryInterface;
}) => {
    await queryInterface.bulkInsert('Roles', [
        {
            id: uuidv4(),
            name: ROLE_NAMES.ADMIN,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            name: ROLE_NAMES.USER,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
};

export const down = () => {};

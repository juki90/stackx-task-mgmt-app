import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import getDi from '@/di';
import { ROLE_NAMES } from '@/models/Role';

import type { Container } from 'inversify';
import type { Migration } from '@/seeders';
import type { QueryInterface } from 'sequelize';
import type { IUserRepository, IRoleRepository } from '@/types';

export const up: Migration = async ({
    context: queryInterface
}: {
    context: QueryInterface;
}) => {
    await queryInterface.bulkInsert('Users', [
        {
            id: uuidv4(),
            firstName: 'John',
            lastName: 'Admin',
            email: 'john.admin@example.com',
            password: bcrypt.hashSync('1234abcd', 12),
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: uuidv4(),
            firstName: 'Jane',
            lastName: 'User',
            email: 'jane.user@example.com',
            password: bcrypt.hashSync('1234abcd', 12),
            createdById: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);

    const di: Container = await getDi();

    const roleRepository = di.get<IRoleRepository>('repositories.role');
    const userRepository = di.get<IUserRepository>('repositories.user');

    const admin = await userRepository.findOne({
        where: { lastName: 'Admin' }
    });
    const user = await userRepository.findOne({
        where: { lastName: 'User' }
    });
    const adminRole = await roleRepository.findOne({
        where: { name: ROLE_NAMES.ADMIN }
    });
    const userRole = await roleRepository.findOne({
        where: { name: ROLE_NAMES.USER }
    });

    await admin.setRole(adminRole);
    await user.setRole(userRole);
    await user.setCreatedBy(admin);
};

export const down = () => {};

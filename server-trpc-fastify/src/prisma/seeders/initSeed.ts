import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import initDi from '~/di';
import { ROLE_NAMES } from '~/config/constants';

import type { TPrisma, IRoleRepository, IUserRepository } from '~/types';

async function runSeeder() {
    let prisma: TPrisma | undefined;

    try {
        const di = await initDi();

        prisma = di.get<TPrisma>('%prisma');

        const roleRepository = di.get<IRoleRepository>('repositories.role');
        const userRepository = di.get<IUserRepository>('repositories.user');

        const adminRole = await roleRepository.create({
            data: {
                id: uuidv4(),
                name: ROLE_NAMES.ADMIN,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        const userRole = await roleRepository.create({
            data: {
                id: uuidv4(),
                name: ROLE_NAMES.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        const admin = await userRepository.create({
            data: {
                id: uuidv4(),
                firstName: 'John',
                lastName: 'Admin',
                email: 'john.admin@example.com',
                password: bcrypt.hashSync('1234abcd', 12),
                createdAt: new Date(),
                updatedAt: new Date(),
                role: { connect: { id: adminRole.id } }
            }
        });

        await userRepository.create({
            data: {
                id: uuidv4(),
                firstName: 'Jane',
                lastName: 'User',
                email: 'jane.user@example.com',
                password: bcrypt.hashSync('1234abcd', 12),
                createdBy: { connect: { id: admin.id } },
                createdAt: new Date(),
                updatedAt: new Date(),
                role: { connect: { id: userRole.id } }
            }
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error(error);
        await prisma?.$disconnect();
        process.exit(1);
    }
}

runSeeder();

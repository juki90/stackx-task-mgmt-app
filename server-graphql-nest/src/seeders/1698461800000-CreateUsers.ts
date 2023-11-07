import { QueryRunner, MigrationInterface } from 'typeorm';

import { ROLE_NAMES, Role } from '@/entities/Role';
import { User } from '@/entities/User';

export class CreateUsers1698461800000 implements MigrationInterface {
    name = 'CreateUsers1698461800000';

    async up(queryRunner: QueryRunner): Promise<void> {
        const roleRepository = queryRunner.connection.getRepository(Role);
        const userRepository = queryRunner.connection.getRepository(User);

        const [adminRole, userRole] = await Promise.all([
            roleRepository.findOneBy({ name: ROLE_NAMES.ADMIN }),
            roleRepository.findOneBy({ name: ROLE_NAMES.USER })
        ]);

        const admin = await userRepository.save(
            userRepository.create({
                firstName: 'John',
                lastName: 'Admin',
                email: 'john.admin@example.com',
                password: '1234abcd',
                createdAt: new Date(),
                updatedAt: new Date(),
                role: adminRole
            })
        );

        await userRepository.save(
            userRepository.create({
                firstName: 'Jane',
                lastName: 'User',
                email: 'jane.user@example.com',
                password: '1234abcd',
                createdAt: new Date(),
                updatedAt: new Date(),
                role: userRole,
                createdBy: admin
            })
        );
    }

    async down(): Promise<void> {}
}

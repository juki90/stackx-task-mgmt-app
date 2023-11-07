import { QueryRunner, MigrationInterface } from 'typeorm';

import { Role, ROLE_NAMES } from '@/entities/Role';

export class CreateRoles1698461200000 implements MigrationInterface {
    name = 'CreateRoles1698461200000';

    async up(queryRunner: QueryRunner): Promise<void> {
        const roleRepository = queryRunner.connection.getRepository(Role);

        await Promise.all([
            roleRepository.save(
                roleRepository.create({
                    name: ROLE_NAMES.ADMIN
                })
            ),
            roleRepository.save(
                roleRepository.create({
                    name: ROLE_NAMES.USER
                })
            )
        ]);
    }

    async down(): Promise<void> {}
}

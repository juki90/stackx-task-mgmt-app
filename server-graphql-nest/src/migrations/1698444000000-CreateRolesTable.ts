import { Table, QueryRunner, MigrationInterface } from 'typeorm';

export class CreateRolesTable1698444000000 implements MigrationInterface {
    name = 'CreateRolesTable1698444000000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createDatabase(process.env.POSTGRES_DB, true);

        await queryRunner.createTable(
            new Table({
                name: 'Roles',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'name',
                        type: 'varchar'
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }),
            true
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('Roles');
    }
}

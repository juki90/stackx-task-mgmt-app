import {
    Table,
    QueryRunner,
    MigrationInterface,
    TableIndex,
    TableForeignKey
} from 'typeorm';

export class CreateUsersTable1698444300000 implements MigrationInterface {
    name = 'CreateUsersTable1698444300000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'Users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'firstName',
                        type: 'varchar'
                    },
                    {
                        name: 'lastName',
                        type: 'varchar'
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isUnique: true
                    },
                    {
                        name: 'password',
                        type: 'varchar'
                    },
                    {
                        name: 'roleId',
                        type: 'uuid'
                    },
                    {
                        name: 'createdById',
                        type: 'uuid',
                        isNullable: true
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
                    },
                    {
                        name: 'deletedAt',
                        type: 'timestamp',
                        isNullable: true,
                        default: null
                    }
                ]
            }),
            true
        );

        await queryRunner.createIndex(
            'Users',
            new TableIndex({
                name: 'IDX_USERS_EMAIL',
                columnNames: ['email'],
                isUnique: true
            })
        );

        await queryRunner.createForeignKey(
            'Users',
            new TableForeignKey({
                columnNames: ['roleId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'Roles'
            })
        );

        await queryRunner.createForeignKey(
            'Users',
            new TableForeignKey({
                columnNames: ['createdById'],
                referencedColumnNames: ['id'],
                referencedTableName: 'Users'
            })
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('Users');
    }
}

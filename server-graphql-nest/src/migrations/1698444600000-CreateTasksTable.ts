import {
    Table,
    QueryRunner,
    TableForeignKey,
    MigrationInterface
} from 'typeorm';

export class CreateTasksTable1698444600000 implements MigrationInterface {
    name: 'CreateTasksTable1698444600000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'Tasks',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'title',
                        type: 'varchar'
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'usersStatus',
                        type: 'jsonb'
                    },
                    {
                        name: 'status',
                        type: 'integer'
                    },
                    {
                        name: 'createdById',
                        type: 'uuid'
                    },
                    {
                        name: 'updatedById',
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
                    }
                ]
            }),
            true
        );

        await queryRunner.createForeignKey(
            'Tasks',
            new TableForeignKey({
                columnNames: ['createdById'],
                referencedColumnNames: ['id'],
                referencedTableName: 'Users'
            })
        );

        await queryRunner.createForeignKey(
            'Tasks',
            new TableForeignKey({
                columnNames: ['updatedById'],
                referencedColumnNames: ['id'],
                referencedTableName: 'Users'
            })
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('Tasks');
    }
}

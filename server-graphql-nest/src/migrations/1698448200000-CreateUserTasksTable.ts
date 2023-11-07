import {
    Table,
    QueryRunner,
    TableForeignKey,
    MigrationInterface
} from 'typeorm';

export class CreateUserTasksTable1698448200000 implements MigrationInterface {
    name = 'CreateUserTasksTable1698448200000';

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'UserTasks',
                columns: [
                    {
                        name: 'userId',
                        type: 'uuid'
                    },
                    {
                        name: 'taskId',
                        type: 'uuid'
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
            'UserTasks',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'Users',
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'UserTasks',
            new TableForeignKey({
                columnNames: ['taskId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'Tasks',
                onDelete: 'CASCADE'
            })
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('UserTasks');
    }
}

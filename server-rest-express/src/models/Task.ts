import { Op, type HasManyGetAssociationsMixin } from 'sequelize';
import {
    Model,
    Table,
    Column,
    Unique,
    Length,
    IsUUID,
    Default,
    DataType,
    AllowNull,
    PrimaryKey,
    BelongsToMany,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';

import User from '@/models/User';
import UserTask from '@/models/UserTask';

import { TaskStatus, TaskUsersStatus, TaskUsersStatusWithUsers } from '@/types';

@Table({
    tableName: 'Tasks',
    timestamps: true
})
export default class Task extends Model {
    @Unique
    @IsUUID(4)
    @PrimaryKey
    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Column
    id!: string;

    @Length({ min: 2, max: 128 })
    @AllowNull(false)
    @Column
    title!: string;

    @Length({ max: 3000 })
    @Column
    description?: string;

    @ForeignKey(() => User)
    @Column
    createdById!: string;

    @BelongsTo(() => User, 'createdById')
    createdBy!: User;

    @ForeignKey(() => User)
    @Column
    updatedById!: string;

    @BelongsTo(() => User, 'updatedById')
    updatedBy!: User;

    @AllowNull(false)
    @Column(DataType.JSONB)
    usersStatus!: TaskUsersStatus;

    @AllowNull(false)
    @Column
    status!: TaskStatus;

    @BelongsToMany(() => User, () => UserTask)
    users: User[];

    getUsers: HasManyGetAssociationsMixin<User>;

    async getUsersStatusWithUsers(): Promise<TaskUsersStatusWithUsers> {
        const usersStatusIds = this.usersStatus.map(({ userId }) => userId);

        const taskUsers = await this.getUsers({
            where: { id: { [Op.in]: usersStatusIds } }
        });

        return taskUsers.map(taskUser => {
            const { doneAt } = this.usersStatus.find(
                ({ userId }) => userId === taskUser.id
            );

            return { user: taskUser, doneAt };
        });
    }
}

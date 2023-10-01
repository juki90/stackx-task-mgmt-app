import { Model, Table, Column, ForeignKey } from 'sequelize-typescript';

import User from '@/models/User';
import Task from '@/models/Task';

import type { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({
    tableName: 'UserTask'
})
export default class UserTask extends Model<
    InferAttributes<UserTask>,
    InferCreationAttributes<UserTask>
> {
    @ForeignKey(() => Task)
    @Column
    taskId: string;

    @ForeignKey(() => User)
    @Column
    userId: string;
}

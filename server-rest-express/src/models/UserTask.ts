import { Model, Table, Column, ForeignKey } from 'sequelize-typescript';

import User from '@/models/User';
import Task from '@/models/Task';

@Table({
    tableName: 'UserTask'
})
export default class UserTask extends Model {
    @ForeignKey(() => Task)
    @Column
    taskId: string;

    @ForeignKey(() => User)
    @Column
    userId: string;
}

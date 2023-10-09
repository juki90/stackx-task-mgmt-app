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
    BelongsTo,
    ForeignKey,
    PrimaryKey,
    BelongsToMany
} from 'sequelize-typescript';

import User from '@/models/User';
import UserTask from '@/models/UserTask';

import type { TaskStatus, TaskUsersStatus } from '@/types';
import type {
    InferAttributes,
    InferCreationAttributes,
    HasManySetAssociationsMixin,
    HasManyGetAssociationsMixin,
    BelongsToSetAssociationMixin,
    HasManyRemoveAssociationsMixin
} from 'sequelize';

@Table({
    tableName: 'Tasks',
    timestamps: true
})
export default class Task extends Model<
    InferAttributes<Task>,
    InferCreationAttributes<Task>
> {
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
    @IsUUID(4)
    @Column
    createdById?: string;

    @BelongsTo(() => User, 'createdById')
    createdBy?: User;

    @ForeignKey(() => User)
    @IsUUID(4)
    @Column
    updatedById?: string;

    @BelongsTo(() => User, 'updatedById')
    updatedBy?: User;

    @AllowNull(false)
    @Column(DataType.JSONB)
    usersStatus!: TaskUsersStatus;

    @AllowNull(false)
    @Column
    status!: TaskStatus;

    @BelongsToMany(() => User, () => UserTask)
    users: User[];

    getUsers: HasManyGetAssociationsMixin<User>;

    setCreatedBy: BelongsToSetAssociationMixin<User, string>;

    setUpdatedBy: BelongsToSetAssociationMixin<User, string>;

    setUsers: HasManySetAssociationsMixin<User, string>;

    removeUsers: HasManyRemoveAssociationsMixin<User, string>;
}

type ModelFields =
    | 'description'
    | 'id'
    | 'title'
    | 'createdById'
    | 'createdBy'
    | 'updatedById'
    | 'updatedBy'
    | 'usersStatus'
    | 'status'
    | 'users'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'version';

export const TASK_UPDATABLE_FIELDS: ModelFields[] = [
    'title',
    'description',
    'usersStatus'
];

export const TASK_UPDATABLE_FIELDS_NO_USERSSTATUS: ModelFields[] = [
    'title',
    'description'
];

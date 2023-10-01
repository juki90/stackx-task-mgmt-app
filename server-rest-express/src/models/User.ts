import {
    Model,
    Index,
    Table,
    Column,
    Unique,
    Length,
    IsUUID,
    IsEmail,
    Default,
    DataType,
    BelongsTo,
    AllowNull,
    PrimaryKey,
    ForeignKey,
    DefaultScope,
    BelongsToMany
} from 'sequelize-typescript';

import Role from '@/models/Role';
import Task from '@/models/Task';
import UserTask from '@/models/UserTask';

import type {
    InferAttributes,
    InferCreationAttributes,
    BelongsToSetAssociationMixin
} from 'sequelize';

@DefaultScope(() => ({
    attributes: { exclude: ['password'] }
}))
@Table({
    tableName: 'Users',
    timestamps: true
})
export default class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    @Unique
    @IsUUID(4)
    @PrimaryKey
    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Column
    id!: string;

    @Length({ min: 2, max: 64 })
    @AllowNull(false)
    @Column
    firstName!: string;

    @Length({ min: 2, max: 32 })
    @AllowNull(false)
    @Column
    lastName!: string;

    @AllowNull(false)
    @Column(DataType.VIRTUAL)
    get fullName(): string {
        return `${this.getDataValue('firstName')} ${this.getDataValue(
            'lastName'
        )}`;
    }

    @Length({ min: 6, max: 255 })
    @IsEmail
    @Index
    @Unique
    @AllowNull(false)
    @Column
    email!: string;

    @Length({ min: 8, max: 32 })
    @AllowNull(false)
    @Column
    password!: string;

    @ForeignKey(() => User)
    @IsUUID(4)
    @Column
    createdById?: string;

    @BelongsTo(() => User, 'createdById')
    createdBy: User;

    @ForeignKey(() => Role)
    @Column
    roleId!: string;

    @BelongsTo(() => Role, 'roleId')
    role: Role;

    @BelongsToMany(() => Task, () => UserTask)
    tasks: Task[];

    setRole: BelongsToSetAssociationMixin<Role, string>;

    setCreatedBy: BelongsToSetAssociationMixin<User, string>;
}

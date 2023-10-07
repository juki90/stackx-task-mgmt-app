import bcrypt from 'bcryptjs';
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
    BeforeSave,
    PrimaryKey,
    ForeignKey,
    DefaultScope,
    BelongsToMany
} from 'sequelize-typescript';

import Task from '@/models/Task';
import UserTask from '@/models/UserTask';
import Role, { ROLE_NAMES } from '@/models/Role';

import type {
    InferAttributes,
    InferCreationAttributes,
    BelongsToSetAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToManyRemoveAssociationMixin
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

    @Length({ min: 2, max: 32 })
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

    @BeforeSave
    static hashPasswordBeforeSave(
        user: User,
        options: { fields?: string[] }
    ): void {
        if (options?.fields?.includes('password')) {
            user.dataValues.password = bcrypt.hashSync(
                user.dataValues.password,
                12
            );
        }
    }

    setRole: BelongsToSetAssociationMixin<Role, string>;

    getRole: BelongsToGetAssociationMixin<Role>;

    removeRole: BelongsToManyRemoveAssociationMixin<Role, string>;

    setCreatedBy: BelongsToSetAssociationMixin<User, string>;

    getCreatedBy: BelongsToGetAssociationMixin<User>;

    async isAdmin(): Promise<boolean> {
        if (this.role?.name) {
            return this.role.name === ROLE_NAMES.ADMIN;
        }

        const role = await this.getRole();

        return role.name === ROLE_NAMES.ADMIN;
    }
}

export const USER_UPDATABLE_FIELDS:
    | (
          | 'firstName'
          | 'lastName'
          | 'email'
          | 'password'
          | 'id'
          | 'createdAt'
          | 'updatedAt'
          | 'deletedAt'
          | 'version'
          | 'fullName'
          | 'createdById'
          | 'createdBy'
          | 'roleId'
          | 'role'
          | 'tasks'
      )[] = ['firstName', 'lastName', 'email', 'password'];

export const USER_UPDATABLE_FIELDS_NO_PASSWORD:
    | (
          | 'firstName'
          | 'lastName'
          | 'email'
          | 'password'
          | 'id'
          | 'createdAt'
          | 'updatedAt'
          | 'deletedAt'
          | 'version'
          | 'fullName'
          | 'createdById'
          | 'createdBy'
          | 'roleId'
          | 'role'
          | 'tasks'
      )[] = ['firstName', 'lastName', 'email'];

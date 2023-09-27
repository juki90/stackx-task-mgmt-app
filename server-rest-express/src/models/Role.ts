import {
    Model,
    Table,
    Column,
    Unique,
    IsUUID,
    HasMany,
    Default,
    DataType,
    AllowNull,
    PrimaryKey
} from 'sequelize-typescript';

import User from '@/models/User';

@Table({
    tableName: 'Roles',
    timestamps: true
})
export default class Role extends Model<Role> {
    @Unique
    @IsUUID(4)
    @PrimaryKey
    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Column
    id!: string;

    @Unique
    @AllowNull(false)
    @Column
    name!: string;

    @HasMany(() => User)
    users: User;
}

export const ROLE_NAMES = {
    USER: 'user',
    ADMIN: 'admin'
};

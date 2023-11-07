import {
    Column,
    Entity,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn
} from 'typeorm';

import { User } from '@/entities/User';

import type * as GraphQlTypes from '@/graphql';

@Entity('Roles')
export class Role implements GraphQlTypes.Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(() => User, user => user.role)
    @JoinColumn()
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export const ROLE_NAMES = {
    USER: 'user',
    ADMIN: 'admin'
};

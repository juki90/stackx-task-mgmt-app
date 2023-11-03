import {
    Entity,
    Unique,
    Column,
    OneToOne,
    ManyToOne,
    JoinTable,
    ManyToMany,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Role } from '@/entities/Role';
import { Task } from '@/entities/Task';

import type * as GraphQlTypes from '@/graphql';

@Entity('Users')
@Unique(['email'])
export class User implements GraphQlTypes.User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @Column()
    email: string;

    @Column({ select: false })
    password: string;

    @OneToOne(() => User)
    @JoinColumn()
    createdBy: User;

    @ManyToMany(() => Task, task => task.users, {
        onDelete: 'CASCADE'
    })
    @JoinTable({
        name: 'UserTasks',
        joinColumn: {
            name: 'userId',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'taskId',
            referencedColumnName: 'id'
        }
    })
    tasks: Task[];

    @ManyToOne(() => Role, role => role.id)
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    hashPassword() {
        if (this?.password) {
            this.password = bcrypt.hashSync(this.password, 12);
        }
    }
}

export const USER_UPDATABLE_FIELDS = [
    'firstName',
    'lastName',
    'email',
    'password'
];

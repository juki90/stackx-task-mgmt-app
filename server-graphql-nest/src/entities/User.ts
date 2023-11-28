import {
    Index,
    Entity,
    Column,
    Unique,
    ManyToOne,
    JoinTable,
    ManyToMany,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Role } from '@/entities/Role';
import { Task } from '@/entities/Task';

import type * as GraphQlTypes from '@/graphql';

@Unique(['id', 'email'])
@Entity('Users')
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

    @Index({ unique: true })
    @Column()
    email: string;

    @Column({ select: false })
    password: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn()
    createdBy?: User;

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

    @DeleteDateColumn({
        default: null,
        nullable: true
    })
    deletedAt: Date;

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

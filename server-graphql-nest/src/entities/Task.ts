import {
    Column,
    Entity,
    ManyToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToOne
} from 'typeorm';

import { User } from '@/entities/User';

import type * as GraphQlTypes from '@/graphql';

@Entity('Tasks')
export class Task implements GraphQlTypes.Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn()
    createdBy: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn()
    updatedBy?: User;

    @ManyToMany(() => User, user => user.tasks, { onDelete: 'CASCADE' })
    users: User[];

    @Column({ type: 'jsonb' })
    usersStatus: GraphQlTypes.UsersStatus[];

    @Column()
    status: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

export const TASK_STATUSES = {
    CANCELLED: -1,
    PENDING: 0,
    DONE: 1,
    VALUES: [-1, 0, 1]
};

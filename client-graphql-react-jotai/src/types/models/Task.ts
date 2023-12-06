import type { User } from '@/types/models';

type UserStatus = {
    userId: string;
    doneAt: string;
};

type TaskUserStatusInfo = Pick<User, 'fullName' | 'id' | 'email'> & {
    doneAt: string;
};

type Task = {
    id: string;
    title: string;
    description?: string;
    status: number;
    usersStatus: UserStatus[];
    createdAt: string;
    updatedAt: string;
    createdBy: User;
    updatedBy?: User;
    users: User[];
};

export type { Task, UserStatus, TaskUserStatusInfo };

import { User } from '@/types/models';

type UserStatus = {
    userId: string;
    doneAt: string;
};

interface Task {
    id: string;
    title: string;
    description: string;
    status: number;
    usersStatus: UserStatus[];
    createdAt: string;
    updatedAt: string;
    createdBy: User;
    updatedBy?: User;
    users: User[];
}

export type { Task };

import type { Role, Task } from '@/types/models';

type User = {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdBy?: User;
    role?: Role;
    tasks?: Task[];
};

export type { User };

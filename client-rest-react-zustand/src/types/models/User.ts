import type { Role, Task } from '@/types/models';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    createdBy: User;
    role?: Role;
    tasks?: Task[];
}

export type { User };

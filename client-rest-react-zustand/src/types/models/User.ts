import type { Role, Task } from '@/types/models';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdBy?: User;
    createdById?: string;
    role?: Role;
    roleId?: string;
    tasks?: Task[];
}

export type { User };

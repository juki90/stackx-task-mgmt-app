import type { User } from '@/types';

type CreateOrUpdateUserFormFields = Omit<
    User,
    'createdAt' | 'updatedAt' | 'fullName' | 'tasks' | 'role' | 'createdBy'
> & {
    general?: string;
    password: string | undefined;
    isAdmin: boolean;
    id: string | undefined;
};

export type { CreateOrUpdateUserFormFields };

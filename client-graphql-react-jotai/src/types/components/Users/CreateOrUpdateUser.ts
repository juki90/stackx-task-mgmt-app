import type { User } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface ICreateOrUpdateUser {
    user?: User | null | undefined;
    isModalOpen: boolean;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}

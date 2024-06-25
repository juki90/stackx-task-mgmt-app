import type { User } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface ICreateOrUpdateUser {
    user?: User;
    isModalOpen: boolean;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}

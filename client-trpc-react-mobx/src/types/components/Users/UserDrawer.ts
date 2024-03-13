import type { User } from '@/types';
import type { Dispatch, SetStateAction } from 'react';

export interface IUserDrawer {
    viewedUserId: string | undefined;
    setViewedUser: Dispatch<SetStateAction<User | undefined>>;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}

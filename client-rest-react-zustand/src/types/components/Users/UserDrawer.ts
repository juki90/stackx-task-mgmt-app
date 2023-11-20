import type { User } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface IUserDrawer {
    viewedUserId: string | null | undefined;
    setViewedUser: Dispatch<SetStateAction<User | null | undefined>>;
    setIsUpdateModalOpen: () => void;
}

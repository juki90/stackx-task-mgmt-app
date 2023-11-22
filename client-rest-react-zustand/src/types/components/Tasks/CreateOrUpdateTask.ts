import type { Task } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface ICreateOrUpdateTask {
    task?: Task | null | undefined;
    isModalOpen: boolean;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}

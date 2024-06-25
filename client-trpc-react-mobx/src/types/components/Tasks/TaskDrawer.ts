import type { Task } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface ITaskDrawer {
    viewedTaskId: string | null | undefined;
    setViewedTask: Dispatch<SetStateAction<Task | null | undefined>>;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}

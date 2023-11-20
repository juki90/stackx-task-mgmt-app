import type { Task } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface IMyDashboardTaskDetails {
    task: Task | null;
    setTask: Dispatch<SetStateAction<Task | null>>;
}

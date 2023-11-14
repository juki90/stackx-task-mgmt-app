import { Task } from '@/types/models';
import { Dispatch, SetStateAction } from 'react';

export interface IMyDashboardTaskDetails {
    task: Task | null;
    setTask: Dispatch<SetStateAction<Task | null>>;
}

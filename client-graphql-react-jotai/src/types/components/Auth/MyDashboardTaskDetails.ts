import type { Task } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';

export interface IMyDashboardTaskDetails {
    task: Task | null;
    formError?: string;
    otherError?: string;
    taskToMarkAsDone?: Task | null;
    setTask: Dispatch<SetStateAction<Task | null>>;
    handleMarkTaskAsDone: (id: string) => Promise<unknown>;
    setTaskToMarkAsDone: Dispatch<SetStateAction<Task | null>>;
    handleCloseMarkAsDoneDialog: () => void;
}

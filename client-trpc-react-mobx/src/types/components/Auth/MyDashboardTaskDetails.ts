import type { Task } from '@/types/models';
import type { Dispatch, SetStateAction } from 'react';
import type { TaskChangeStatusRequest } from '@/types';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';

export interface IMyDashboardTaskDetails {
    task: Task | null;
    formError?: string;
    otherError?: string;
    taskToMarkAsDone?: Task | null;
    setTask: Dispatch<SetStateAction<Task | null>>;
    handleMarkTaskAsDone: UseMutateAsyncFunction<
        unknown,
        Error,
        TaskChangeStatusRequest,
        unknown
    >;
    setTaskToMarkAsDone: Dispatch<SetStateAction<Task | null>>;
    handleCloseMarkAsDoneDialog: () => void;
}

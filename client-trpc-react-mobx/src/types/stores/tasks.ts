import type { Task } from '@/types/models';
import type { PaginationInfo } from '@/types/stores';

interface ITasksStore {
    task: Task | undefined;
    tasks: Task[];
    taskPagination: PaginationInfo | undefined;
    setTask: (task: Task | undefined) => void;
    setTasks: (tasks: Task[]) => void;
    setTaskPagination: (page: PaginationInfo | undefined) => void;
    reset: () => void;
}

export type { ITasksStore };

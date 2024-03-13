import type { Task } from '@/types/models';
import type { PaginationInfo } from '@/types/stores';

interface TasksSlice {
    task: Task | undefined;
    tasks: Task[];
    taskPagination: PaginationInfo | undefined;
    'task/set': (task: Task | undefined) => void;
    'tasks/set': (tasks: Task[]) => void;
    'taskPagination/set': (page: PaginationInfo | undefined) => void;
}

export type { TasksSlice };

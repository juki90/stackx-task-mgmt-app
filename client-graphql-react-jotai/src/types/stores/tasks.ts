import { Task, PaginationInfo } from '@/types';

interface TasksSlice {
    task: Task | null;
    tasks: Task[];
    taskPagination: PaginationInfo | undefined;
    'task/set': (task: Task | undefined) => void;
    'tasks/set': (tasks: Task[]) => void;
    'taskPagination/set': (page: PaginationInfo | undefined) => void;
}

export type { TasksSlice };

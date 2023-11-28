import type { StateCreator } from 'zustand';
import type { Task, TasksSlice, PaginationInfo } from '@/types';

const initialTasksState: () => {
    task: null;
    tasks: Task[];
    taskPagination: PaginationInfo;
} = () => ({
    task: null,
    tasks: [],
    taskPagination: { size: 10, index: 0, total: 0 }
});

export const createTasksSlice: (
    resetFns: ((state: unknown) => unknown | Partial<unknown>)[]
) => StateCreator<TasksSlice, [], [], TasksSlice> = resetFns => set => {
    resetFns.push(() => {
        return set(initialTasksState());
    });

    return {
        ...initialTasksState(),
        'taskPagination/set': (taskPagination: PaginationInfo | undefined) =>
            set(() => ({ taskPagination })),
        'task/set': (task: Task | null | undefined) =>
            set(() => ({
                task
            })),
        'tasks/set': (tasks: Task[]) =>
            set(() => ({
                tasks
            }))
    };
};

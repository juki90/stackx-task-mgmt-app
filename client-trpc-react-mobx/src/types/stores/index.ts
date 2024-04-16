import type { IAuthStore, ITasksStore, IUsersStore } from '@/types';

interface IRootStore {
    authStore: IAuthStore;
    usersStore: IUsersStore;
    tasksStore: ITasksStore;
}
type PaginationInfo = { size: number; index: number; total: number };

export type { IRootStore, PaginationInfo };

export * from '@/types/stores/auth';
export * from '@/types/stores/users';
export * from '@/types/stores/tasks';

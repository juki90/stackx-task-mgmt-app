import type { Task } from '@/types';
import { type } from 'os';

type TasksFetchRequest = {
    page: {
        size: number;
        index: number;
    };
    filter?: string;
};
type TasksFetchResponse = { rows: Task[]; count: number };
type TasksFetchRequestParams = {
    page: string;
    filter?: string;
};
type TaskShowRequest = string;
type TaskShowResponse = Task;
type TaskCreateRequest = Omit<
    Task,
    | 'id'
    | 'updatedAt'
    | 'createdAt'
    | 'createdBy'
    | 'deletedAt'
    | 'createdById'
    | 'updatedById'
    | 'status'
    | 'users'
    | 'usersStatus'
> & { userIds: string[] };
type TaskUpdateResponse = Task;
type TaskUpdateRequest = Omit<
    Task,
    | 'updatedAt'
    | 'createdAt'
    | 'createdBy'
    | 'deletedAt'
    | 'createdById'
    | 'updatedById'
    | 'status'
    | 'users'
    | 'usersStatus'
> & { userIds: string[] };
type TaskCreateResponse = Task;
type TaskDeleteRequest = string;
type TaskDeleteResponse = void;
type TaskChangeStatusRequest = { id: string; status: number };
type TaskChangeStatusResponse = { id: string; status: number };

export type {
    TaskShowRequest,
    TaskShowResponse,
    TasksFetchRequest,
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskDeleteRequest,
    TaskDeleteResponse,
    TaskCreateResponse,
    TasksFetchResponse,
    TaskUpdateResponse,
    TasksFetchRequestParams,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
};

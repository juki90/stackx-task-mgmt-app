import type { AppRouterInputs, AppRouterOutputs } from '@/plugins/trpc';

type TasksCreateRequest = AppRouterInputs['tasks']['create'];
type TasksCreateResponse = AppRouterOutputs['tasks']['create'];
type TasksUpdateRequest = AppRouterInputs['tasks']['update'];
type TasksUpdateResponse = AppRouterOutputs['tasks']['update'];
type TasksFetchRequest = AppRouterInputs['tasks']['fetch'];
type TasksFetchResponse = AppRouterOutputs['tasks']['fetch'];
type TasksShowRequest = AppRouterInputs['tasks']['show'];
type TasksShowResponse = AppRouterOutputs['tasks']['show'];
type TasksDeleteRequest = AppRouterInputs['tasks']['delete'];
type TasksDeleteResponse = AppRouterOutputs['tasks']['delete'];
type TaskChangeStatusRequest = AppRouterInputs['tasks']['changeStatus'];
type TaskChangeStatusResponse = AppRouterOutputs['tasks']['changeStatus'];

export type {
    TasksShowRequest,
    TasksShowResponse,
    TasksFetchRequest,
    TasksFetchResponse,
    TasksDeleteRequest,
    TasksCreateRequest,
    TasksUpdateRequest,
    TasksUpdateResponse,
    TasksCreateResponse,
    TasksDeleteResponse,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
};

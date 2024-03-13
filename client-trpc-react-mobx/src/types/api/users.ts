import type { AppRouterInputs, AppRouterOutputs } from '@/plugins/trpc';

type UsersCreateRequest = AppRouterInputs['users']['create'];
type UsersCreateResponse = AppRouterOutputs['users']['create'];
type UsersUpdateRequest = AppRouterInputs['users']['update'];
type UsersUpdateResponse = AppRouterOutputs['users']['update'];
type UsersFetchRequest = AppRouterInputs['users']['fetch'];
type UsersFetchResponse = AppRouterOutputs['users']['fetch'];
type UsersShowRequest = AppRouterInputs['users']['show'];
type UsersShowResponse = AppRouterOutputs['users']['show'];
type UsersDeleteRequest = AppRouterInputs['users']['delete'];
type UsersDeleteResponse = AppRouterOutputs['users']['delete'];

export type {
    UsersShowRequest,
    UsersShowResponse,
    UsersFetchRequest,
    UsersFetchResponse,
    UsersDeleteRequest,
    UsersCreateRequest,
    UsersUpdateRequest,
    UsersUpdateResponse,
    UsersCreateResponse,
    UsersDeleteResponse
};

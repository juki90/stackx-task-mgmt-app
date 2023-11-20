import type { User } from '@/types';

type UsersFetchRequest = {
    page: {
        size: number;
        index: number;
    };
    filter?: string;
};
type UsersFetchResponse = { rows: User[]; count: number };
type UsersFetchRequestParams = {
    page: string;
    filter?: string;
};
type UserShowRequest = string;
type UserShowResponse = User;
type UserCreateRequest = Omit<
    User,
    | 'id'
    | 'updatedAt'
    | 'createdAt'
    | 'createdBy'
    | 'deletedAt'
    | 'createdById'
    | 'role'
    | 'roleId'
    | 'tasks'
    | 'fullName'
> & { isAdmin: boolean; password: string };
type UserUpdateResponse = User;
type UserUpdateRequest = Omit<
    User,
    | 'updatedAt'
    | 'createdAt'
    | 'createdBy'
    | 'deletedAt'
    | 'createdById'
    | 'role'
    | 'roleId'
    | 'tasks'
    | 'fullName'
> & { isAdmin: boolean; password?: string | undefined };
type UserCreateResponse = User;
type UserDeleteRequest = string;
type UserDeleteResponse = void;

export type {
    UserShowRequest,
    UserShowResponse,
    UsersFetchRequest,
    UserCreateRequest,
    UserUpdateRequest,
    UserDeleteRequest,
    UserDeleteResponse,
    UserCreateResponse,
    UsersFetchResponse,
    UserUpdateResponse,
    UsersFetchRequestParams
};

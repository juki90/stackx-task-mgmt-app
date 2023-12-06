import type {
    AuthLoginRequest,
    UserCreateRequest,
    UserUpdateRequest,
    TaskCreateRequest,
    TaskUpdateRequest
} from '@/types';

export * from '@/types/api/auth';
export * from '@/types/api/users';
export * from '@/types/api/tasks';
export * from '@/types/api/shared';

type TRequest =
    | AuthLoginRequest
    | UserCreateRequest
    | UserUpdateRequest
    | TaskCreateRequest
    | TaskUpdateRequest;

export type { TRequest };

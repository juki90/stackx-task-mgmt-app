import type { User } from '@/types/models';
import type { PaginationInfo } from '@/types/stores';

interface UsersSlice {
    user: User | undefined;
    users: User[];
    userPagination: PaginationInfo | undefined;
    'user/set': (user: User | undefined) => void;
    'users/set': (users: User[]) => void;
    'userPagination/set': (page: PaginationInfo | undefined) => void;
}

export type { UsersSlice };

import { User, PaginationInfo } from '@/types';

interface UsersSlice {
    user: User | null;
    users: User[];
    userPagination: PaginationInfo | undefined;
    'user/set': (user: User | undefined) => void;
    'users/set': (users: User[]) => void;
    'userPagination/set': (page: PaginationInfo | undefined) => void;
}

export type { UsersSlice };

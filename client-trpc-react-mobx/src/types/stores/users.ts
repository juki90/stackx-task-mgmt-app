import type { User } from '@/types/models';
import type { PaginationInfo } from '@/types/stores';

interface IUsersStore {
    user: User | undefined;
    users: User[];
    userPagination: PaginationInfo | undefined;
    setUser: (user: User | undefined) => void;
    setUsers: (users: User[]) => void;
    setUserPagination: (page: PaginationInfo | undefined) => void;
    reset: () => void;
}

export type { IUsersStore };

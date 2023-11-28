import type { StateCreator } from 'zustand';
import type { User, UsersSlice, PaginationInfo } from '@/types';

const initialUsersState: () => {
    user: null;
    users: User[];
    userPagination: PaginationInfo;
} = () => ({
    user: null,
    users: [],
    userPagination: { size: 10, index: 0, total: 0 }
});

export const createUsersSlice: (
    resetFns: ((state: unknown) => unknown | Partial<unknown>)[]
) => StateCreator<UsersSlice, [], [], UsersSlice> = resetFns => set => {
    resetFns.push(() => {
        return set(initialUsersState());
    });

    return {
        ...initialUsersState(),
        'userPagination/set': (userPagination: PaginationInfo | undefined) =>
            set(() => ({ userPagination })),
        'user/set': (user: User | null | undefined) =>
            set(() => ({
                user
            })),
        'users/set': (users: User[]) =>
            set(() => ({
                users
            }))
    };
};

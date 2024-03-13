import type { StateCreator } from 'zustand';
import type { User, UsersSlice, PaginationInfo } from '@/types';

const initialUsersState: () => {
    user: User | undefined;
    users: User[];
    userPagination: PaginationInfo;
} = () => ({
    user: undefined,
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
        'user/set': (user: User | undefined) =>
            set(() => ({
                user
            })),
        'users/set': (users: User[]) =>
            set(() => ({
                users
            }))
    };
};

import type { StateCreator } from 'zustand';
import type { AuthSlice, TState, User } from '@/types';

const initialAuthState: () => {
    loggedUser: User | null;
    me: User | null;
} = () => {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');

    return { loggedUser, me: null };
};

export const createAuthSlice: (
    resetFns: ((state: unknown) => unknown | Partial<unknown>)[]
) => StateCreator<AuthSlice, [], [], AuthSlice> = resetFns => set => {
    resetFns.push(() => {
        localStorage.removeItem('loggedUser');

        return set(initialAuthState());
    });

    return {
        ...initialAuthState(),
        'loggedUser/set': (user: User) =>
            set(() => {
                localStorage.setItem('loggedUser', JSON.stringify(user));

                return { loggedUser: user };
            }),
        'me/set': me => set(() => ({ me }))
    };
};

import type { StateCreator } from 'zustand';
import type { AuthSlice, User } from '@/types';

const initialAuthState = { loggedUser: null, me: null };

export const createAuthSlice: StateCreator<
    AuthSlice,
    [],
    [],
    AuthSlice
> = set => ({
    ...initialAuthState,
    'loggedUser/set': (user: User) => set(() => ({ loggedUser: user })),
    'me/set': () => set(state => ({ me: state.me })),
    'auth/reset': () => set(initialAuthState)
});

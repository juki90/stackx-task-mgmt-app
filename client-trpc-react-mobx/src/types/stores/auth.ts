import type { User } from '@/types/models';

interface IAuthStore {
    me: User | undefined;
    loggedUser: User | undefined;
    isLoggedUserAdmin: boolean | undefined;
    setLoggedUser: () => void;
    setMe: (user: User | undefined) => void;
    initState: () => void;
    reset: () => void;
}

export type { IAuthStore };

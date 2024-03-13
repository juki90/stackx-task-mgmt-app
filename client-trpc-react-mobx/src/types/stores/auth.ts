import type { User } from '@/types/models';

interface AuthSlice {
    loggedUser: User | undefined;
    me: User | undefined;
    'loggedUser/set': () => void;
    'loggedUser/isAdmin': boolean | null;
    'me/set': (user: User | undefined) => void;
}

export type { AuthSlice };

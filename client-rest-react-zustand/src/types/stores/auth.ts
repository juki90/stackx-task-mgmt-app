import { User } from '@/types/models';

interface AuthSlice {
    loggedUser: User | null;
    me: User | null;
    'loggedUser/set': () => void;
    'loggedUser/isAdmin': boolean | null;
    'me/set': (user: User) => void;
}

export type { AuthSlice };

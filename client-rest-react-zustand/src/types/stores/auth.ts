import { User } from '@/types/models';

interface AuthSlice {
    loggedUser: User | null;
    me: User | null;
    'loggedUser/set': (user: User) => void;
    'me/set': (user: User) => void;
}

export type { AuthSlice };

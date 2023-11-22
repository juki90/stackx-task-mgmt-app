import { jwtDecode as decodeJwt } from 'jwt-decode';

import { en as messages } from '@/locales';
import { ROLES } from '@/config/constants';

import type { StateCreator } from 'zustand';
import type { User, AuthSlice } from '@/types';
import toast from 'react-hot-toast';

const initialAuthState: () => {
    loggedUser: User | null;
    'loggedUser/isAdmin': boolean | null;
    me: User | null;
} = () => {
    let loggedUser = null;

    try {
        loggedUser = decodeJwt(
            localStorage.getItem('access_token') || ''
        ) as User | null;
    } catch (error) {
        console.error(error);
    }

    return {
        loggedUser,
        'loggedUser/isAdmin': loggedUser?.role?.name === ROLES.ADMIN,
        me: null
    };
};

export const createAuthSlice: (
    resetFns: ((state: unknown) => unknown | Partial<unknown>)[]
) => StateCreator<AuthSlice, [], [], AuthSlice> = resetFns => set => {
    resetFns.push(() => {
        localStorage.removeItem('access_token');

        return set(initialAuthState());
    });

    return {
        ...initialAuthState(),
        'loggedUser/set': () =>
            set(() => {
                let loggedUser = null;

                try {
                    loggedUser = decodeJwt(
                        localStorage.getItem('access_token') || 'null'
                    ) as User | null;
                } catch (error) {
                    console.error(error);

                    toast.error(messages.invalidAccessToken);

                    localStorage.clear();
                }

                return {
                    loggedUser,
                    'loggedUser/isAdmin': loggedUser?.role?.name === ROLES.ADMIN
                };
            }),
        'me/set': (me: User | null) => set(() => ({ me }))
    };
};

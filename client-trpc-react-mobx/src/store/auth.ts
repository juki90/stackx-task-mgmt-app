import toast from 'react-hot-toast';
import { jwtDecode as decodeJwt } from 'jwt-decode';

import { en as messages } from '@/locales';
import { ROLES } from '@/config/constants';

import type { StateCreator } from 'zustand';
import type { User, Role, AuthSlice } from '@/types';

const initialAuthState: () => {
    loggedUser: User | undefined;
    'loggedUser/isAdmin': boolean;
    me: User | undefined;
} = () => {
    let loggedUser = undefined;

    try {
        loggedUser = decodeJwt(localStorage.getItem('access_token') || '') as
            | User
            | undefined;
    } catch (error) {
        console.error(error);
    }

    return {
        loggedUser,
        'loggedUser/isAdmin':
            (loggedUser as User & { role?: Role })?.role?.name === ROLES.ADMIN,
        me: undefined
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
                let loggedUser = undefined;

                try {
                    loggedUser = decodeJwt(
                        localStorage.getItem('access_token') || 'null'
                    ) as User | undefined;
                } catch (error) {
                    console.error(error);

                    toast.error(messages.invalidAccessToken);

                    localStorage.clear();
                }

                return {
                    loggedUser: loggedUser || undefined,
                    'loggedUser/isAdmin':
                        (loggedUser as User & { role?: Role })?.role?.name ===
                        ROLES.ADMIN
                };
            }),
        'me/set': (me: User | undefined) => set(() => ({ me }))
    };
};

import { atom } from 'jotai';
import { jwtDecode as decodeJwt } from 'jwt-decode';

import { ROLES } from '@/config/constants';

import type { User } from '@/types';

const readLoggedUserFromAccessToken = () => {
    try {
        return decodeJwt(
            localStorage.getItem('access_token') || ''
        ) as User | null;
    } catch (error) {
        return null;
    }
};

const loggedUserAtom = atom<User | null>(null);

loggedUserAtom.onMount = setAtom => setAtom(readLoggedUserFromAccessToken());

const meAtom = atom<User | null>(null);
const loggedUserIsAdminAtom = atom(
    get => get(loggedUserAtom)?.role?.name === ROLES.ADMIN
);

export {
    meAtom,
    loggedUserAtom,
    loggedUserIsAdminAtom,
    readLoggedUserFromAccessToken
};

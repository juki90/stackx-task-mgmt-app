import toast from 'react-hot-toast';
import { makeAutoObservable } from 'mobx';
import { jwtDecode as decodeJwt } from 'jwt-decode';

import { en as messages } from '@/locales';
import { ROLES } from '@/config/constants';

import type { User, Role, IAuthStore } from '@/types';

export class AuthStore implements IAuthStore {
    loggedUser: User | undefined;

    me: User | undefined;

    constructor() {
        makeAutoObservable(this);
        this.initState();
    }

    get isLoggedUserAdmin(): boolean | undefined {
        return (
            (this.loggedUser as User & { role?: Role })?.role?.name ===
            ROLES.ADMIN
        );
    }

    setLoggedUser = () => {
        let loggedUser;

        try {
            loggedUser = decodeJwt(
                localStorage.getItem('access_token') || 'null'
            ) as User | undefined;
        } catch (error) {
            console.error(error);

            toast.error(messages.invalidAccessToken);

            localStorage.clear();
        }

        this.loggedUser = loggedUser || undefined;
    };

    setMe = (me: User | undefined) => {
        this.me = me;
    };

    initState = () => {
        let loggedUser;

        try {
            loggedUser = decodeJwt(
                localStorage.getItem('access_token') || ''
            ) as User | undefined;
        } catch (error) {
            console.error(error);
        }

        this.loggedUser = loggedUser;
        this.me = undefined;
    };

    reset = () => {
        localStorage.removeItem('access_token');

        this.me = undefined;
        this.loggedUser = undefined;
    };
}

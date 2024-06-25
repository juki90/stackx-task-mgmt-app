import { makeAutoObservable } from 'mobx';

import type { User, IUsersStore, PaginationInfo } from '@/types';

export class UsersStore implements IUsersStore {
    user: User | undefined;

    users: User[] = [];

    userPagination: PaginationInfo | undefined;

    constructor() {
        makeAutoObservable(this);
        this.initState();
    }

    setUserPagination: (pagination: PaginationInfo | undefined) => void = (
        pagination: PaginationInfo | undefined
    ) => {
        this.userPagination = pagination;
    };

    setUser: (user: User | undefined) => void = (user: User | undefined) => {
        this.user = user;
    };

    setUsers: (users: User[]) => void = (users: User[]) => {
        this.users = users;
    };

    initState = () => {
        this.user = undefined;
        this.users = [];
        this.userPagination = { size: 10, index: 0, total: 0 };
    };

    reset = () => {
        this.user = undefined;
        this.users = [];
    };
}

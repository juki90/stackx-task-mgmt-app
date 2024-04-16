import { AuthStore } from '@/store/auth';
import { UsersStore } from '@/store/users';
import { TasksStore } from '@/store/tasks';

import type { IRootStore } from '@/types';

class RootStore implements IRootStore {
    authStore: AuthStore;
    usersStore: UsersStore;
    tasksStore: TasksStore;

    constructor() {
        this.authStore = new AuthStore();
        this.usersStore = new UsersStore();
        this.tasksStore = new TasksStore();
    }
}

const store = new RootStore();

const resetFns = Object.values(store).map(({ reset }) => reset);

const resetAllSlices = () => resetFns.forEach(fn => fn());

export { store, resetAllSlices };

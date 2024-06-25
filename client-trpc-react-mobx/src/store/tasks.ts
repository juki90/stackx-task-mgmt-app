import { makeAutoObservable } from 'mobx';

import type { Task, ITasksStore, PaginationInfo } from '@/types';

export class TasksStore implements ITasksStore {
    task: Task | undefined;

    tasks: Task[] = [];

    taskPagination: PaginationInfo | undefined;

    constructor() {
        makeAutoObservable(this);
        this.initState();
    }

    setTaskPagination: (pagination: PaginationInfo | undefined) => void = (
        pagination: PaginationInfo | undefined
    ) => {
        this.taskPagination = pagination;
    };

    setTask: (task: Task | undefined) => void = (task: Task | undefined) => {
        this.task = task;
    };

    setTasks: (tasks: Task[]) => void = (tasks: Task[]) => {
        this.tasks = tasks;
    };

    initState = () => {
        this.task = undefined;
        this.tasks = [];
        this.taskPagination = { size: 10, index: 0, total: 0 };
    };

    reset = () => {
        this.task = undefined;
        this.tasks = [];
    };
}

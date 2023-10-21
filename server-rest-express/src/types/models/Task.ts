import type TaskModel from '@/models/Task';
import type { UserModel } from '@/types';

type TaskAttributes = TaskModel;

type Task = TaskModel;

enum TaskStatus {
    PENDING = 0,
    DONE = 1,
    CANCELLED = -1
}

type TaskUsersStatus = { userId: string; doneAt?: Date | null }[];

type TaskUsersStatusWithUsers = { user: UserModel; doneAt?: Date }[];

export type {
    Task,
    TaskModel,
    TaskStatus,
    TaskAttributes,
    TaskUsersStatus,
    TaskUsersStatusWithUsers
};

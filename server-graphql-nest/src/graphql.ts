
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class LoginInput {
    email: string;
    password: string;
}

export class PageArg {
    size: number;
    index: number;
}

export class CreateTaskInput {
    title: string;
    description: string;
    userIds: string[];
}

export class UpdateTaskInput {
    title: string;
    description: string;
    userIds: string[];
}

export class ChangeTaskStatusInput {
    status: number;
}

export class CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

export class UpdateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password?: Nullable<string>;
    isAdmin: boolean;
}

export abstract class IQuery {
    me: User;
    tasks?: Nullable<Task>[];
    task?: Nullable<Task>;
    users?: Nullable<User>[];
    user?: Nullable<User>;
}

export abstract class IMutation {
    login?: User;
    createTask?: Task;
    updateTask?: Nullable<Task>;
    changeTaskStatus?: Nullable<Task>;
    deleteTask?: Nullable<Task>;
    createUser?: User;
    updateUser?: Nullable<User>;
    deleteUser?: Nullable<User>;
}

export class Role {
    id: string;
    name: string;
    createdAt?: Nullable<Date>;
    updatedAt?: Nullable<Date>;
}

export class Task {
    id: string;
    title: string;
    description?: Nullable<string>;
    status: number;
    usersStatus?: Nullable<UsersStatus[]>;
    createdBy: User;
    updatedBy?: Nullable<User>;
    users?: Nullable<User[]>;
    createdAt?: Nullable<Date>;
    updatedAt?: Nullable<Date>;
}

export class UsersStatus {
    userId: string;
    doneAt?: Nullable<Date>;
}

export class User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    createdBy?: Nullable<User>;
    role?: Nullable<Role>;
    tasks?: Nullable<Task[]>;
    createdAt?: Nullable<Date>;
    updatedAt?: Nullable<Date>;
}

type Nullable<T> = T | null;

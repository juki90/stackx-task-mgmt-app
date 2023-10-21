/* eslint-disable no-var */
import 'reflect-metadata';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import request, { type SuperTest, type Test } from 'supertest';

import createApp from '@/index';
import loginAs from './helpers/loginAs';
import { ROLE_NAMES } from '@/models/Role';
import { en as messages } from '@/locales';
import UserFactory from './factories/user';
import TaskFactory from './factories/task';
import runSeeders from './helpers/runSeeders';
import clearDatabase from './helpers/clearDatabase';
import findFieldErrorMessage from './helpers/findFieldErrorMessage';

import type { Express } from 'express';
import type { Container } from 'inversify';
import type {
    Sequelize,
    ITaskRepository,
    IUserRepository,
    IRoleRepository
} from '@/types';

type TStatusCodes = typeof StatusCodes;
type TMessages = typeof messages;
type TRoleNames = typeof ROLE_NAMES;
type TLoginAs = typeof loginAs;
type TRunSeeders = typeof runSeeders;
type TFindFieldErrorMessage = typeof findFieldErrorMessage;
type TUserFactory = typeof UserFactory;
type TTaskFactory = typeof TaskFactory;

declare global {
    var app: Express;
    var di: Container;
    var rootPath: string;
    var basePath: string;
    var messages: TMessages;
    var sequelize: Sequelize;
    var runSeeders: TRunSeeders;
    var clearDatabase: () => Promise<void>;
    var request: SuperTest<Test>;
    var StatusCodes: TStatusCodes;
    var userRepository: IUserRepository;
    var roleRepository: IRoleRepository;
    var taskRepository: ITaskRepository;
    var loginAs: TLoginAs;
    var ROLE_NAMES: TRoleNames;
    var findFieldErrorMessage: TFindFieldErrorMessage;
    var UserFactory: TUserFactory;
    var TaskFactory: TTaskFactory;
}

export default async () => {
    const app: Express = await createApp();
    const di = app.get('di');
    const rootPath = path.join(__dirname, '..');
    const sequelize = di.get('services.sequelize');
    const userRepository = di.get('repositories.user');
    const taskRepository = di.get('repositories.task');
    const roleRepository = di.get('repositories.role');

    globalThis.di = di;
    globalThis.app = app;
    globalThis.rootPath = rootPath;
    globalThis.messages = messages;
    globalThis.basePath = __dirname;
    globalThis.sequelize = sequelize;
    globalThis.request = request(app);
    globalThis.StatusCodes = StatusCodes;
    globalThis.userRepository = userRepository;
    globalThis.UserFactory = UserFactory;
    globalThis.TaskFactory = TaskFactory;
    globalThis.taskRepository = taskRepository;
    globalThis.roleRepository = roleRepository;
    globalThis.runSeeders = runSeeders;
    globalThis.clearDatabase = clearDatabase;
    globalThis.loginAs = loginAs;
    globalThis.ROLE_NAMES = ROLE_NAMES;
    globalThis.findFieldErrorMessage = findFieldErrorMessage;
};

export type { TRunSeeders };

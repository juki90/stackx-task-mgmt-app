/* eslint-disable no-var */
import 'reflect-metadata';
import path from 'path';
import { StatusCodes } from 'http-status-codes';

import initDi from '~/di';
import fastify from '~/index';
import loginAs from '~/helpers/loginAs';
import { ROLE } from '~/config/constants';
import { en as messages } from '~/locales';
import UserFactory from '~/factories/user';
import TaskFactory from '~/factories/task';
import { teardown } from '~/helpers/teardown';
import runSeeders from '~/helpers/runSeeders';
import clearDatabase from '~/helpers/clearDatabase';
import findFieldErrorMessage from '~/helpers/findFieldErrorMessage';
import { extractPayload, preparePayload } from '~/helpers/payloadConverter';

import type { Container } from 'inversify';
import type { TPrisma, Fastify } from '~/types';

type TMessages = typeof messages;
type TRoleNames = typeof ROLE.NAMES;
type TLoginAs = typeof loginAs;
type TRunSeeders = typeof runSeeders;
type TFindFieldErrorMessage = typeof findFieldErrorMessage;
type TUserFactory = typeof UserFactory;
type TTaskFactory = typeof TaskFactory;
type TStatusCodes = typeof StatusCodes;

declare global {
    var app: Fastify;
    var di: Container;
    var rootPath: string;
    var basePath: string;
    var messages: TMessages;
    var prisma: TPrisma;
    var runSeeders: TRunSeeders;
    var teardown: (app: Fastify) => Promise<void>;
    var loginAs: TLoginAs;
    var ROLE_NAMES: TRoleNames;
    var findFieldErrorMessage: TFindFieldErrorMessage;
    var UserFactory: TUserFactory;
    var TaskFactory: TTaskFactory;
    var clearDatabase: () => Promise<void>;
    var extractPayload: <T>(payload: string) => T;
    var preparePayload: <T>(payload: T) => { json: T };
    var StatusCodes: TStatusCodes;
}

export const bootstrap = async () => {
    const di = await initDi();
    const app = fastify;
    const prisma = di.get<TPrisma>('%prisma');
    const rootPath = path.join(__dirname, '..');
    const userRepository = di.get('repositories.user');
    const taskRepository = di.get('repositories.task');
    const roleRepository = di.get('repositories.role');

    globalThis.di = di;
    globalThis.app = app;
    globalThis.rootPath = rootPath;
    globalThis.messages = messages;
    globalThis.basePath = __dirname;
    globalThis.prisma = prisma;
    globalThis.userRepository = userRepository;
    globalThis.UserFactory = UserFactory;
    globalThis.TaskFactory = TaskFactory;
    globalThis.taskRepository = taskRepository;
    globalThis.roleRepository = roleRepository;
    globalThis.runSeeders = runSeeders;
    globalThis.teardown = teardown;
    globalThis.loginAs = loginAs;
    globalThis.ROLE_NAMES = ROLE.NAMES;
    globalThis.findFieldErrorMessage = findFieldErrorMessage;
    globalThis.clearDatabase = clearDatabase;
    globalThis.extractPayload = extractPayload;
    globalThis.preparePayload = preparePayload;
    globalThis.StatusCodes = StatusCodes;
};

export type { TRunSeeders };

/* eslint-disable no-var */
import { Test, type TestingModule } from '@nestjs/testing';
import request, {
    type Variables,
    type SuperTestGraphQL
} from 'supertest-graphql';

import { DataSource } from 'typeorm';
import loginAs from './helpers/loginAs';
import { AppModule } from '@/appModule';
import userFactory from './factories/user';
import taskFactory from './factories/task';
import { en as messages } from '@/locales';
import runSeeders from './helpers/runSeeders';
import clearDatabase from './helpers/clearDatabase';
import { UserRepository } from '@/repositories/User';
import { TaskRepository } from '@/repositories/Task';
import { RoleRepository } from '@/repositories/Role';
import requestExecutor from './helpers/requestExecutor';
import findFieldErrorMessage from './helpers/findFieldErrorMessage';
import useCustomValidationPipe from '@/plugins/useCustomValidationPipe';
import type { Server } from 'http';
import type { INestApplication } from '@nestjs/common';

type TRunSeeders = typeof runSeeders;
type RequestExecutor = typeof requestExecutor;
type LoginAs = typeof loginAs;
type TMessages = typeof messages;
type TFindFieldErrorMessage = typeof findFieldErrorMessage;
type GraphQLFormError = {
    formErrors: {
        message: string;
        field: string;
    }[];
};
type TUserFactory = typeof userFactory;
type TTaskFactory = typeof taskFactory;

declare global {
    var app: INestApplication;
    var entities: DataSource['options']['entities'];
    var typeOrmManager: DataSource['manager'];
    var typeOrmConnection: DataSource['manager']['connection'];
    var clearDatabase: () => Promise<void>;
    var runSeeders: TRunSeeders;
    var userRepository: UserRepository;
    var taskRepository: TaskRepository;
    var roleRepository: RoleRepository;
    var request: <TData, TVariables extends Variables = Variables>(
        app: unknown
    ) => SuperTestGraphQL<TData, TVariables>;
    var appServer: Server;
    var requestExecutor: RequestExecutor;
    var loginAs: LoginAs;
    var messages: TMessages;
    var findFieldErrorMessage: TFindFieldErrorMessage;
    var userFactory: TUserFactory;
    var taskFactory: TTaskFactory;
}

export default async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
    }).compile();

    const app = moduleFixture.createNestApplication();
    useCustomValidationPipe(app);
    await app.init();

    const dataSource = app.get<DataSource>(DataSource);
    const entities = dataSource.options.entities;
    const typeOrmManager = dataSource.manager;
    const typeOrmConnection = typeOrmManager.connection;
    const appServer = app.getHttpServer();

    globalThis.app = app;
    globalThis.entities = entities;
    globalThis.typeOrmManager = typeOrmManager;
    globalThis.typeOrmConnection = typeOrmConnection;
    globalThis.clearDatabase = clearDatabase;
    globalThis.runSeeders = runSeeders;
    globalThis.request = request;
    globalThis.loginAs = loginAs;
    globalThis.findFieldErrorMessage = findFieldErrorMessage;
    globalThis.appServer = appServer;
    globalThis.messages = messages;
    globalThis.requestExecutor = requestExecutor;
    globalThis.userFactory = userFactory;
    globalThis.taskFactory = taskFactory;
    globalThis.userRepository =
        moduleFixture.get<UserRepository>(UserRepository);
    globalThis.taskRepository =
        moduleFixture.get<TaskRepository>(TaskRepository);
    globalThis.roleRepository =
        moduleFixture.get<RoleRepository>(RoleRepository);
};

export type { TRunSeeders, GraphQLFormError };

import tap from 'tap';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
import { en as messages } from '~/locales';
import TaskFactory from '~/factories/task';
import runSeeders from '~/helpers/runSeeders';
import { teardown } from '~/helpers/teardown';
import clearDatabase from '~/helpers/clearDatabase';
import findFieldErrorMessage from '~/helpers/findFieldErrorMessage';
import {
    extractPayload,
    preparePayload,
    prepareQueryInput
} from '~/helpers/payloadConverter';

import type { AppRouter } from '~/router';
import type { InjectOptions } from 'fastify';
import type { inferRouterOutputs } from '@trpc/server';
import type { FastifyInjectResponseWithOptionalJwt } from '~/types';

try {
    let seedersData;
    const sharedRequestOptions = (id: string) =>
        ({
            method: 'POST',
            url: `/trpc/tasks.update${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const { OK, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR } =
        StatusCodes;

    type TasksUpdateResponse = inferRouterOutputs<AppRouter>['tasks']['update'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK sending valid data as ADMIN', async t => {
        const { adminUser } = seedersData;
        const editableTask = await TaskFactory.create(adminUser.email);
        const generatedTask = await TaskFactory.generate();
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(editableTask.id),
            payload: preparePayload({
                id: editableTask.id,
                ...generatedTask
            }),
            headers: {
                authorization: token
            }
        });

        const updatedTask = extractPayload<TasksUpdateResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(updatedTask?.id);
        t.equal(updatedTask?.title, generatedTask.title);
        t.equal(updatedTask?.description, generatedTask.description);
        t.equal(updatedTask?.usersStatus.length, 1);
        t.equal(updatedTask?.createdById, adminUser.id);
        t.notOk(updatedTask?.createdBy);
        t.ok(updatedTask?.updatedById);
        t.ok(jwt);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST sending empty form data as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const editableTask = await TaskFactory.create(adminUser.email);
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(editableTask.id),
                payload: preparePayload({
                    id: editableTask.id,
                    title: '',
                    description: '',
                    userIds: []
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'title'),
                messages.validators.shared.fieldShouldNotBeEmpty
            );
            t.equal(
                findFieldErrorMessage(payload, 'userIds'),
                messages.validators.tasks.userIdsIncorrectAmount
            );
            t.notOk(findFieldErrorMessage(payload, 'description'));
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect data types as ADMIN',
        async t => {
            const { adminUser } = seedersData;

            const editableTask = await TaskFactory.create(adminUser.email);
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(editableTask.id),
                payload: preparePayload({
                    id: editableTask.id,
                    title: 1,
                    description: [],
                    userIds: false
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'title'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'description'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'userIds'),
                messages.validators.shared.fieldShouldBeArray
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns UNAUTHORZIED sending correct data as logged out',
        async t => {
            const taskId = uuidv4();
            const generatedTask = await TaskFactory.generate();
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(taskId),
                payload: preparePayload({ id: taskId, ...generatedTask })
            });

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN sending correct data as USER', async t => {
        const { user } = seedersData;

        const editableTask = await TaskFactory.create(user.email);
        const generatedTask = await TaskFactory.generate();
        const { token } = await loginAs(app, user.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(editableTask.id),
            payload: preparePayload({ id: editableTask.id, ...generatedTask }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, FORBIDDEN);
        t.equal(findFieldErrorMessage(payload), 'FORBIDDEN');
        t.ok(jwt);
        t.end();
    });

    tap.test(
        "returns INTERNAL_SERVER_ERROR sending not existing user's id",
        async t => {
            const { adminUser } = seedersData;

            const editableTask = await TaskFactory.create(adminUser.email);
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(editableTask.id),
                payload: preparePayload({
                    id: editableTask.id,
                    title: "not existing user's task",
                    description: '',
                    userIds: [uuidv4()]
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, INTERNAL_SERVER_ERROR);
            t.equal(
                findFieldErrorMessage(payload, 'userIds'),
                messages.validators.tasks.notAllUsersFromArrayExist
            );
            t.ok(jwt);
            t.end();
        }
    );
} catch (err) {
    console.error(err);
}

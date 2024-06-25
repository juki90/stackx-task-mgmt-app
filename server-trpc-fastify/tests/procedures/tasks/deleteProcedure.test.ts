import tap from 'tap';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
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
            url: `/trpc/tasks.delete${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const { OK, FORBIDDEN, UNAUTHORIZED } = StatusCodes;

    type TasksDeleteResponse = inferRouterOutputs<AppRouter>['tasks']['delete'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK deleting task as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);
        const createdTask = await TaskFactory.create(adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(createdTask.id),
            payload: preparePayload({ id: createdTask.id }),
            headers: {
                authorization: token
            }
        });

        const deletedTask = extractPayload<TasksDeleteResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(jwt);
        t.notOk(deletedTask);
        t.end();
    });

    tap.test('returns OK deleting not existing task as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions('abc'),
            payload: preparePayload({ id: 'abc' }),
            headers: {
                authorization: token
            }
        });

        const deletedTask = extractPayload<TasksDeleteResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(jwt);
        t.notOk(deletedTask);
        t.end();
    });

    tap.test('returns FORBIDDEN deleting task by USER', async t => {
        const { user } = seedersData;
        const { token } = await loginAs(app, user.email);
        const createdTask = await TaskFactory.create(user.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(createdTask.id),
            payload: preparePayload({ id: createdTask.id }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, FORBIDDEN);
        t.equal(findFieldErrorMessage(payload), 'FORBIDDEN');
        t.ok(jwt);
        t.end();
    });

    tap.test('returns UNAUTHORIZED deleting when logged out', async t => {
        const taskId = uuidv4();

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(taskId),
            payload: preparePayload({ id: taskId })
        });

        t.equal(statusCode, UNAUTHORIZED);
        t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
        t.notOk(jwt);
        t.end();
    });
} catch (err) {
    console.error(err);
}

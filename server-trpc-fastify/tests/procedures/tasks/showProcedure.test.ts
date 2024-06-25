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
import { extractPayload, prepareQueryInput } from '~/helpers/payloadConverter';

import type { AppRouter } from '~/router';
import type { InjectOptions } from 'fastify';
import type { inferRouterOutputs } from '@trpc/server';
import type { FastifyInjectResponseWithOptionalJwt } from '~/types';

try {
    let seedersData;
    let precreatedTask;
    const sharedRequestOptions = (id: string) =>
        ({
            method: 'GET',
            url: `/trpc/tasks.show${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const { OK, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } = StatusCodes;

    type TasksShowResponse = inferRouterOutputs<AppRouter>['tasks']['show'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();

        const { adminUser } = seedersData;

        precreatedTask = await TaskFactory.create(adminUser.email);
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK showing task as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(precreatedTask.id),
            headers: {
                authorization: token
            }
        });

        const showedTask = extractPayload<TasksShowResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(showedTask.title, precreatedTask.title);
        t.equal(showedTask.description, precreatedTask.description);
        t.ok(showedTask.createdBy);
        t.ok(showedTask.createdById);
        t.ok(showedTask.id);
        t.ok(showedTask.users);
        t.ok(jwt);
        t.notOk(showedTask.updatedBy);
        t.notOk(showedTask.updatedById);

        showedTask.usersStatus.forEach(userStatus => {
            t.ok(userStatus.userId);
            t.notOk(userStatus.doneAt);
        });

        t.end();
    });

    tap.test('returns NOT_FOUND trying to show not existing task', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(uuidv4()),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, NOT_FOUND);
        t.equal(findFieldErrorMessage(payload), 'NOT_FOUND');
        t.ok(jwt);
        t.end();
    });

    tap.test(
        'returns UNAUTHORIZED showing task by not logged in user',
        async t => {
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject(
                sharedRequestOptions(precreatedTask.id)
            );

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN showing task by USER', async t => {
        const { user } = seedersData;
        const { token } = await loginAs(app, user.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(precreatedTask.id),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, FORBIDDEN);
        t.equal(findFieldErrorMessage(payload), 'FORBIDDEN');
        t.ok(jwt);
        t.end();
    });
} catch (err) {
    console.error(err);
}

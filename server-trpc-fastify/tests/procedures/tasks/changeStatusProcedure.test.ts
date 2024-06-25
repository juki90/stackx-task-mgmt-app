import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
import { en as messages } from '~/locales';
import TaskFactory from '~/factories/task';
import runSeeders from '~/helpers/runSeeders';
import { teardown } from '~/helpers/teardown';
import clearDatabase from '~/helpers/clearDatabase';
import findFieldErrorMessage from '~/helpers/findFieldErrorMessage';
import { preparePayload, prepareQueryInput } from '~/helpers/payloadConverter';

import type { InjectOptions } from 'fastify';
import type { FastifyInjectResponseWithOptionalJwt } from '~/types';

try {
    let seedersData, alreadyDoneTask, cancelledTask;
    const sharedRequestOptions = (id: string) =>
        ({
            method: 'POST',
            url: `/trpc/tasks.changeStatus${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();

        const { adminUser } = seedersData;

        alreadyDoneTask = await TaskFactory.create(adminUser.email, {
            status: 0,
            userIds: [adminUser.id],
            usersStatus: [{ userId: adminUser.id, doneAt: new Date() }]
        });
        cancelledTask = await TaskFactory.create(adminUser.email, {
            status: -1,
            userIds: [adminUser.id]
        });
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK when marking as done by ADMIN', async t => {
        const { adminUser } = seedersData;

        const editableTask = await TaskFactory.create(adminUser.email, {
            userIds: [adminUser.id]
        });
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(editableTask.id),
            payload: preparePayload({ id: editableTask.id, status: 1 }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, OK);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns OK when cancelling task by ADMIN', async t => {
        const { adminUser } = seedersData;

        const editableTask = await TaskFactory.create(adminUser.email);
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(editableTask.id),
            payload: preparePayload({ id: editableTask.id, status: -1 }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, OK);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns BAD_REQUEST when sending no status', async t => {
        const { adminUser } = seedersData;

        const editableTask = await TaskFactory.create(adminUser.email);
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(editableTask.id),
            payload: preparePayload({ id: editableTask.id }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, BAD_REQUEST);
        t.equal(
            findFieldErrorMessage(payload, 'status'),
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        t.notOk(jwt);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST when sending incorrect status type',
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
                payload: preparePayload({ id: editableTask.id, status: 'a' }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'status'),
                messages.validators.tasks.notAllowedTaskStatus
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST when sending incorrect status number',
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
                payload: preparePayload({ id: editableTask.id, status: 2 }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'status'),
                messages.validators.tasks.notAllowedTaskStatus
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST marking as done already done task',
        async t => {
            const { adminUser } = seedersData;

            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(alreadyDoneTask.id),
                payload: preparePayload({ id: alreadyDoneTask.id, status: 1 }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload),
                messages.validators.tasks.alreadyDone
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test('returns BAD_REQUEST marking as done cancelled task', async t => {
        const { adminUser } = seedersData;

        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(cancelledTask.id),
            payload: preparePayload({ id: cancelledTask.id, status: 1 }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, BAD_REQUEST);
        t.equal(
            findFieldErrorMessage(payload),
            messages.validators.tasks.unsupportedStatusChange
        );
        t.ok(jwt);
        t.end();
    });

    tap.test('returns BAD_REQUEST when cancelling task by USER', async t => {
        const { user, adminUser } = seedersData;

        const { token } = await loginAs(app, user.email);
        const editableTask = await TaskFactory.create(adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(editableTask.id),
            payload: preparePayload({ id: editableTask.id, status: -1 }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, BAD_REQUEST);
        t.equal(
            findFieldErrorMessage(payload),
            messages.validators.tasks.onlyAdminCanCancelTask
        );
        t.ok(jwt);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST when user tries to undo done task',
        async t => {
            const { user, adminUser } = seedersData;
            const { token } = await loginAs(app, user.email);
            const editableTask = await TaskFactory.create(adminUser.email, {
                userIds: [user.id],
                usersStatus: [{ userId: user.id, doneAt: new Date() }]
            });
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(editableTask.id),
                payload: preparePayload({ id: editableTask.id, status: 0 }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload),
                messages.validators.tasks.unsupportedStatusChange
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST when user tries to mark as pending cancelled task',
        async t => {
            const { user, adminUser } = seedersData;
            const { token } = await loginAs(app, user.email);
            const editableTask = await TaskFactory.create(adminUser.email, {
                status: -1,
                userIds: [user.id],
                usersStatus: [{ userId: user.id, doneAt: new Date() }]
            });
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(editableTask.id),
                payload: preparePayload({ id: editableTask.id, status: 1 }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload),
                messages.validators.tasks.unsupportedStatusChange
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test(
        'returns UNAUTHORIZED sending valid data when logged out',
        async t => {
            const { adminUser } = seedersData;
            const editableTask = await TaskFactory.create(adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(editableTask.id),
                payload: preparePayload({ id: editableTask.id, status: 1 })
            });

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );
} catch (err) {
    console.error(err);
}

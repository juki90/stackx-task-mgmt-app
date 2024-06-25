import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
import { en as messages } from '~/locales';
import UserFactory from '~/factories/user';
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
            url: `/trpc/users.delete${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const { OK, FORBIDDEN, UNAUTHORIZED } = StatusCodes;

    type UsersDeleteResponse = inferRouterOutputs<AppRouter>['users']['delete'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK deleting user as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);
        const createdUser = await UserFactory.create({
            isAdmin: false
        });

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(createdUser.id),
            payload: preparePayload({ id: createdUser.id }),
            headers: {
                authorization: token
            }
        });

        const deletedUser = extractPayload<UsersDeleteResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(jwt);
        t.notOk(deletedUser);
        t.end();
    });

    tap.test('returns OK deleting not existing user as ADMIN', async t => {
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

        const deletedUser = extractPayload<UsersDeleteResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(jwt);
        t.notOk(deletedUser);
        t.end();
    });

    tap.test(
        'returns FORBIDDEN when admin tries to delete himself',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(adminUser.id),
                payload: preparePayload({ id: adminUser.id }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, FORBIDDEN);
            t.equal(
                findFieldErrorMessage(payload),
                messages.validators.users.unableToDeleteYourself
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN deleting admin by regular admin', async t => {
        const { adminUser } = seedersData;
        const createdUser = await UserFactory.create({
            isAdmin: true
        });
        const { token } = await loginAs(app, createdUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(adminUser.id),
            payload: preparePayload({ id: adminUser.id }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, FORBIDDEN);
        t.equal(
            findFieldErrorMessage(payload),
            messages.validators.users.notDeletableUserByYou
        );
        t.ok(jwt);
        t.end();
    });

    tap.test('returns FORBIDDEN deleting user by user', async t => {
        const { user } = seedersData;
        const { token } = await loginAs(app, user.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(user.id),
            payload: preparePayload({ id: user.id }),
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
        const { user } = seedersData;

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(user.id),
            payload: preparePayload({ id: user.id })
        });

        t.equal(statusCode, UNAUTHORIZED);
        t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
        t.notOk(jwt);
        t.end();
    });
} catch (err) {
    console.error(err);
}

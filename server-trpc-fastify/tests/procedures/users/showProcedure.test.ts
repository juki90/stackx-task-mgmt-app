import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
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
    const sharedRequestOptions = (id: string) =>
        ({
            method: 'GET',
            url: `/trpc/users.show${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const { OK, FORBIDDEN, NOT_FOUND, UNAUTHORIZED } = StatusCodes;

    type UsersShowResponse = inferRouterOutputs<AppRouter>['users']['show'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK showing user as ADMIN', async t => {
        const { adminUser, user } = seedersData;
        const { token } = await loginAs(app, adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(user.id),
            headers: {
                authorization: token
            }
        });

        const showedUser = extractPayload<UsersShowResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(showedUser.firstName, user.firstName);
        t.equal(showedUser.lastName, user.lastName);
        t.equal(showedUser.email, user.email);
        t.equal(showedUser.fullName, `${user.firstName} ${user.lastName}`);
        t.equal(showedUser.tasks?.length, 0);
        t.ok(showedUser.role);
        t.ok(showedUser.createdBy);
        t.ok(showedUser.id);
        t.ok(jwt);
        t.notOk(showedUser.password);
        t.end();
    });

    tap.test('returns NOT_FOUND trying to show not existing user', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions('abc'),
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
        'returns UNAUTHORIZED showing user by not logged in user',
        async t => {
            const { user } = seedersData;

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject(
                sharedRequestOptions(user.id)
            );

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN showing user by USER', async t => {
        const { adminUser, user } = seedersData;
        const { token } = await loginAs(app, user.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(adminUser.id),
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

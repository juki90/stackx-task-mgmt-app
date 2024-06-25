import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
import runSeeders from '~/helpers/runSeeders';
import { teardown } from '~/helpers/teardown';
import clearDatabase from '~/helpers/clearDatabase';
import { extractPayload } from '~/helpers/payloadConverter';
import findFieldErrorMessage from '~/helpers/findFieldErrorMessage';

import type { AppRouter } from '~/router';
import type { InjectOptions } from 'fastify';
import type { inferRouterOutputs } from '@trpc/server';
import type { FastifyInjectResponseWithOptionalJwt } from '~/types';

try {
    let seedersData;
    const sharedRequestOptions = {
        method: 'GET',
        url: '/trpc/auth.me'
    } as Partial<InjectOptions>;
    const { OK, UNAUTHORIZED } = StatusCodes;

    type MeResponse = inferRouterOutputs<AppRouter>['auth']['me'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK when logged in as MAIN ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            headers: {
                authorization: token
            }
        });
        const me = extractPayload<MeResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(me?.id, adminUser.id);
        t.equal(me?.firstName, adminUser.firstName);
        t.equal(me?.lastName, adminUser.lastName);
        t.equal(me?.email, adminUser.email);
        t.notOk(me?.createdById);
        t.notOk(me?.createdBy);
        t.equal(me?.roleId, adminUser.roleId);
        t.ok(me?.role);
        t.strictSame(me?.tasks?.length, 0);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns OK when logged in as USER', async t => {
        const { user } = seedersData;
        const { token } = await loginAs(app, user.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            headers: {
                authorization: token
            }
        });
        const me = extractPayload<MeResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(me?.id, user.id);
        t.equal(me?.firstName, user.firstName);
        t.equal(me?.lastName, user.lastName);
        t.equal(me?.email, user.email);
        t.equal(me?.createdById, user.createdById);
        t.ok(me?.createdBy);
        t.equal(me?.roleId, user.roleId);
        t.ok(me?.role);
        t.equal(me?.tasks?.length, 0);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns UNAUTHORIZED when logged out', async t => {
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject(
            sharedRequestOptions
        );

        t.equal(statusCode, UNAUTHORIZED);
        t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
        t.notOk(jwt);
        t.end();
    });
} catch (err) {
    console.error(err);
}

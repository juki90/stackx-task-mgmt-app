import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import { en as messages } from '~/locales';
import runSeeders from '~/helpers/runSeeders';
import { teardown } from '~/helpers/teardown';
import clearDatabase from '~/helpers/clearDatabase';
import findFieldErrorMessage from '~/helpers/findFieldErrorMessage';
import { extractPayload, preparePayload } from '~/helpers/payloadConverter';

import type { AppRouter } from '~/router';
import type { InjectOptions } from 'fastify';
import type { FastifyInjectResponseWithOptionalJwt } from '~/types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

try {
    let seedersData;
    const sharedRequestOptions = {
        method: 'POST',
        url: '/trpc/auth.login'
    } as Partial<InjectOptions>;
    const { OK, BAD_REQUEST } = StatusCodes;

    type LoginInput = inferRouterInputs<AppRouter>['auth']['login'];
    type LoginResponse = inferRouterOutputs<AppRouter>['auth']['login'];

    tap.before(async () => {
        await clearDatabase();

        seedersData = await runSeeders();
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK sending correct data loggin in as ADMIN', async t => {
        const { adminUser } = seedersData;
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload<LoginInput>({
                email: adminUser.email,
                password: '1234abcd'
            })
        });
        const loggedUser = extractPayload<LoginResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(loggedUser?.email, adminUser.email);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns OK sending correct data loggin in as USER', async t => {
        const { user } = seedersData;
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload({
                email: user.email,
                password: '1234abcd'
            })
        });
        const loggedUser = extractPayload<LoginResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(loggedUser?.email, user.email);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns BAD_REQUEST sending empty form values', async t => {
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload({
                email: '',
                password: ''
            })
        });

        t.equal(statusCode, BAD_REQUEST);
        t.equal(
            findFieldErrorMessage(payload, 'email'),
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        t.equal(
            findFieldErrorMessage(payload, 'password'),
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        t.notOk(jwt);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST sending incorrect types of form values',
        async t => {
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload({
                    email: 0,
                    password: false
                })
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'email'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'password'),
                messages.validators.shared.fieldShouldBeString
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns BAD_REQUEST sending incorrect email', async t => {
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload({
                email: 'incorrect@example.test',
                password: '1234abcd'
            })
        });

        t.equal(statusCode, BAD_REQUEST);
        t.notOk(findFieldErrorMessage(payload, 'email'));
        t.notOk(findFieldErrorMessage(payload, 'password'));
        t.equal(
            findFieldErrorMessage(payload),
            messages.validators.auth.incorrectEmailOrPassword
        );
        t.notOk(jwt);
        t.end();
    });

    tap.test('returns BAD_REQUEST sending incorrect password', async t => {
        const { adminUser } = seedersData;
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload({
                email: adminUser.email,
                password: '1234abcdX'
            })
        });

        t.equal(statusCode, BAD_REQUEST);
        t.notOk(findFieldErrorMessage(payload, 'email'));
        t.notOk(findFieldErrorMessage(payload, 'password'));
        t.equal(
            findFieldErrorMessage(payload),
            messages.validators.auth.incorrectEmailOrPassword
        );
        t.notOk(jwt);
        t.end();
    });

    tap.test('returns BAD_REQUEST sending incorrect password', async t => {
        const { adminUser } = seedersData;
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload({
                email: adminUser.email,
                password: '1234abcdX'
            })
        });

        t.equal(statusCode, BAD_REQUEST);
        t.notOk(findFieldErrorMessage(payload, 'email'));
        t.notOk(findFieldErrorMessage(payload, 'password'));
        t.equal(
            findFieldErrorMessage(payload),
            messages.validators.auth.incorrectEmailOrPassword
        );
        t.notOk(jwt);
        t.end();
    });
} catch (err) {
    console.error(err);
}

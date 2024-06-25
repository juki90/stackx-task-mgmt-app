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
import { extractPayload, preparePayload } from '~/helpers/payloadConverter';

import type { AppRouter } from '~/router';
import type { InjectOptions } from 'fastify';
import type { inferRouterOutputs } from '@trpc/server';
import type { FastifyInjectResponseWithOptionalJwt } from '~/types';

try {
    let seedersData;
    const sharedRequestOptions = {
        method: 'POST',
        url: '/trpc/users.create'
    } as Partial<InjectOptions>;
    const { OK, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR } =
        StatusCodes;

    type UsersCreateResponse = inferRouterOutputs<AppRouter>['users']['create'];

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
        const generatedUser = UserFactory.generate();
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload(generatedUser),
            headers: {
                authorization: token
            }
        });

        const createdUser = extractPayload<UsersCreateResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(createdUser?.id);
        t.equal(createdUser?.firstName, generatedUser.firstName);
        t.equal(createdUser?.lastName, generatedUser.lastName);
        t.equal(
            createdUser?.fullName,
            `${generatedUser.firstName} ${generatedUser.lastName}`
        );
        t.equal(createdUser?.email, generatedUser.email);
        t.equal(createdUser?.createdById, adminUser.id);
        t.notOk(createdUser?.password);
        t.notOk(createdUser?.createdBy);
        t.ok(createdUser?.roleId);
        t.notOk(createdUser?.role);
        t.ok(jwt);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST sending empty form values as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    isAdmin: false
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'firstName'),
                messages.validators.shared.fieldShouldNotBeEmpty
            );
            t.equal(
                findFieldErrorMessage(payload, 'lastName'),
                messages.validators.shared.fieldShouldNotBeEmpty
            );
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
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect data types as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload({
                    firstName: 1,
                    lastName: true,
                    email: [],
                    password: {},
                    isAdmin: 0
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'firstName'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'lastName'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'email'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'password'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'isAdmin'),
                messages.validators.shared.fieldShouldBeBoolean
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect values as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload({
                    firstName: 'a',
                    lastName: 'b',
                    email: 'a@b',
                    password: 'c',
                    isAdmin: false
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'firstName'),
                messages.validators.users.nameIncorrectLength
            );
            t.equal(
                findFieldErrorMessage(payload, 'lastName'),
                messages.validators.users.nameIncorrectLength
            );
            t.equal(
                findFieldErrorMessage(payload, 'email'),
                messages.validators.shared.fieldShouldBeAnEmail
            );
            t.equal(
                findFieldErrorMessage(payload, 'password'),
                messages.validators.shared.incorrectPasswordLength
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        "returns BAD_REQUEST sending existing user's email as ADMIN",
        async t => {
            const { adminUser, user } = seedersData;
            const generatedUser = UserFactory.generate({ email: user.email });
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload(generatedUser),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, INTERNAL_SERVER_ERROR);
            t.equal(
                findFieldErrorMessage(payload, 'email'),
                messages.validators.users.userWithThisEmailExists
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test(
        'returns UNAUTHORIZED sending correct data as logged out',
        async t => {
            const generatedUser = UserFactory.generate();
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload(generatedUser)
            });

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN sending valid data as USER', async t => {
        const { user } = seedersData;
        const generatedUser = UserFactory.generate();
        const { token } = await loginAs(app, user.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload(generatedUser),
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

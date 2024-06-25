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
            url: `/trpc/users.update${prepareQueryInput({ id })}`
        }) as Partial<InjectOptions>;
    const {
        OK,
        FORBIDDEN,
        NOT_FOUND,
        BAD_REQUEST,
        UNAUTHORIZED,
        INTERNAL_SERVER_ERROR
    } = StatusCodes;

    type UsersUpdateResponse = inferRouterOutputs<AppRouter>['users']['update'];

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
        const { token } = await loginAs(app, adminUser.email);
        const createdUser = await UserFactory.create({
            isAdmin: false
        });
        const generatedUserData = UserFactory.generate({ isAdmin: false });

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(createdUser.id),
            payload: preparePayload({
                id: createdUser.id,
                ...generatedUserData
            }),
            headers: {
                authorization: token
            }
        });

        const updatedUser = extractPayload<UsersUpdateResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(updatedUser?.firstName, generatedUserData.firstName);
        t.equal(updatedUser?.lastName, generatedUserData.lastName);
        t.equal(
            updatedUser?.fullName,
            `${generatedUserData.firstName} ${generatedUserData.lastName}`
        );
        t.equal(updatedUser?.email, generatedUserData.email);
        t.equal(updatedUser?.createdById, createdUser.createdById);
        t.equal(updatedUser?.roleId, createdUser.roleId);
        t.ok(updatedUser?.id);
        t.ok(updatedUser?.createdBy);
        t.ok(updatedUser?.role);
        t.ok(jwt);
        t.notOk(updatedUser?.password);
        t.end();
    });

    tap.test('returns OK updating user by regular ADMIN', async t => {
        const [regularAdmin, createdUser] = await Promise.all([
            UserFactory.create({
                isAdmin: true
            }),
            UserFactory.create({
                isAdmin: false
            })
        ]);

        const { token } = await loginAs(app, regularAdmin.email);
        const generatedUserData = UserFactory.generate({ isAdmin: false });

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(createdUser.id),
            payload: preparePayload({
                id: createdUser.id,
                ...generatedUserData
            }),
            headers: {
                authorization: token
            }
        });

        const updatedUser = extractPayload<UsersUpdateResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(updatedUser?.firstName, generatedUserData.firstName);
        t.equal(updatedUser?.lastName, generatedUserData.lastName);
        t.equal(
            updatedUser?.fullName,
            `${generatedUserData.firstName} ${generatedUserData.lastName}`
        );
        t.equal(updatedUser?.email, generatedUserData.email);
        t.equal(updatedUser?.createdById, createdUser.createdById);
        t.equal(updatedUser?.roleId, createdUser.roleId);
        t.ok(updatedUser?.id);
        t.ok(updatedUser?.createdBy);
        t.ok(updatedUser?.role);
        t.ok(jwt);
        t.notOk(updatedUser?.password);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST sending empty form data as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(adminUser.id),
                payload: preparePayload({
                    id: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: ''
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'id'),
                messages.validators.shared.fieldShouldNotBeEmpty
            );
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
                ...sharedRequestOptions(adminUser.id),
                payload: preparePayload({
                    id: 1,
                    firstName: 1,
                    lastName: true,
                    email: [],
                    isAdmin: 0
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'id'),
                messages.validators.shared.fieldShouldBeString
            );
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
                findFieldErrorMessage(payload, 'isAdmin'),
                messages.validators.shared.fieldShouldBeBoolean
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect data values as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(adminUser.id),
                payload: preparePayload({
                    firstName: 'a',
                    lastName: 'b',
                    email: 'a@b',
                    password: '2short'
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
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns UNAUTHORIZED sending valid data when logged out',
        async t => {
            const { user } = seedersData;
            const generatedUser = UserFactory.generate({ isAdmin: false });
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(user.id),
                payload: preparePayload({
                    id: user.id,
                    ...generatedUser
                })
            });

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns FORBIDDEN when main admin tries to change his role',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);
            const generatedUser = UserFactory.generate({ isAdmin: false });
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(adminUser.id),
                payload: preparePayload({ id: adminUser.id, ...generatedUser }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, FORBIDDEN);
            t.equal(
                findFieldErrorMessage(payload),
                messages.validators.users.cantRemoveAdminRole
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN trying to update user as USER', async t => {
        const { user } = seedersData;
        const { token } = await loginAs(app, user.email);

        delete user.password;

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions(user.id),
            payload: preparePayload({
                ...user,
                isAdmin: false
            }),
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
        'returns FORBIDDEN when admin tries to edit admin by whom is created',
        async t => {
            const { adminUser: mainAdmin } = seedersData;
            const generatedAdmin = UserFactory.generate({ isAdmin: true });
            const createdAdmin = await UserFactory.create(generatedAdmin);
            const { token } = await loginAs(app, createdAdmin.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(mainAdmin.id),
                payload: preparePayload({
                    ...generatedAdmin,
                    id: mainAdmin.id,
                    email: mainAdmin.email
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, FORBIDDEN);
            t.equal(
                findFieldErrorMessage(payload),
                messages.validators.users.notUpdatableUserByYou
            );
            t.ok(jwt);
            t.end();
        }
    );

    tap.test(
        'returns NOT_FOUND when admin tries to edit admin by whom is created',
        async t => {
            const { adminUser } = seedersData;
            const generatedUser = UserFactory.generate({ isAdmin: true });
            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions('abc'),
                payload: preparePayload({
                    ...generatedUser,
                    id: 'abc'
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, NOT_FOUND);
            t.equal(findFieldErrorMessage(payload), 'NOT_FOUND');
            t.ok(jwt);
            t.end();
        }
    );

    tap.test(
        "returns INTERNAL_SERVER_ERROR sending existing user's email",
        async t => {
            const { adminUser, user } = seedersData;
            const { token } = await loginAs(app, adminUser.email);
            const generatedUser = UserFactory.generate({ isAdmin: false });
            const createdUser = await UserFactory.create(generatedUser);

            generatedUser.email = user.email;

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions(createdUser.id),
                payload: preparePayload({
                    id: createdUser.id,
                    ...generatedUser
                }),
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
} catch (err) {
    console.error(err);
}

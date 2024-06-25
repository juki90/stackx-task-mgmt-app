import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import initDi from '~/di';
import loginAs from '~/helpers/loginAs';
import UserFactory from '~/factories/user';
import { en as messages } from '~/locales';
import runSeeders from '~/helpers/runSeeders';
import { teardown } from '~/helpers/teardown';
import clearDatabase from '~/helpers/clearDatabase';
import findFieldErrorMessage from '~/helpers/findFieldErrorMessage';
import { extractPayload, prepareQueryInput } from '~/helpers/payloadConverter';

import type { AppRouter } from '~/router';
import type { InjectOptions } from 'fastify';
import type { inferRouterOutputs } from '@trpc/server';
import type {
    User,
    IUserRepository,
    FastifyInjectResponseWithOptionalJwt
} from '~/types';

try {
    let seedersData, allUsers, userRepository;
    const sharedRequestOptions = (
        filters:
            | {
                  page?:
                      | { size?: number | string; index?: number | string }
                      | string;
                  filter?: string;
              }
            | string
    ) =>
        ({
            method: 'GET',
            url: `/trpc/users.fetch${prepareQueryInput(filters)}`
        }) as Partial<InjectOptions>;
    const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;

    type UsersFetchResponse = inferRouterOutputs<AppRouter>['users']['fetch'];

    tap.before(async () => {
        const di = await initDi();

        await clearDatabase();

        seedersData = await runSeeders();

        await Promise.all([
            UserFactory.create({ isAdmin: true }),
            UserFactory.create({ isAdmin: false })
        ]);

        userRepository = di.get<IUserRepository>('repositories.user');
        allUsers = await userRepository.findMany({});
    });

    tap.after(async () => {
        await clearDatabase();
        await teardown(app);
    });

    tap.test('returns OK fetching paginated results as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions({ page: { size: 2, index: 0 } }),
            headers: {
                authorization: token
            }
        });

        const users = extractPayload<UsersFetchResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(users.rows.length, 2);
        t.ok(jwt);

        users.rows.forEach(user => {
            const precreatedUser = allUsers.find(
                (userFromAll: User) => user.id === userFromAll.id
            );

            t.equal(user.firstName, precreatedUser.firstName);
            t.equal(user.lastName, precreatedUser.lastName);
            t.equal(user.email, precreatedUser.email);
            t.equal(
                user.fullName,
                `${precreatedUser.firstName} ${precreatedUser.lastName}`
            );
            t.ok(user.id);
            t.notOk(user.tasks);
            t.notOk(user.role);
            t.notOk(user.createdBy);
            t.notOk(user.password);
        });

        t.end();
    });

    tap.test('returns OK fetching matching filter user as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);
        const precreatedUser = await userRepository.findOne({});

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions({
                page: { size: 2, index: 0 },
                filter: precreatedUser.email
            }),
            headers: {
                authorization: token
            }
        });

        const users = extractPayload<UsersFetchResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(users.rows.length, 1);
        t.equal(users.count, 1);
        t.ok(jwt);

        const [user] = users.rows;

        t.equal(user.firstName, precreatedUser.firstName);
        t.equal(user.lastName, precreatedUser.lastName);
        t.equal(user.email, precreatedUser.email);
        t.equal(
            user.fullName,
            `${precreatedUser.firstName} ${precreatedUser.lastName}`
        );
        t.ok(user.id);
        t.notOk(user.tasks);
        t.notOk(user.role);
        t.notOk(user.createdBy);
        t.notOk(user.password);
        t.end();
    });

    tap.test(
        'returns BAD_REQUEST skipping query page info as ADMIN',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions({}),
                headers: {
                    authorization: token
                }
            });

            t.equal(
                findFieldErrorMessage(payload, 'page'),
                messages.validators.shared.fieldShouldNotBeEmpty
            );
            t.equal(statusCode, BAD_REQUEST);
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect page query param type',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions({ page: 'page' }),
                headers: {
                    authorization: token
                }
            });

            t.equal(
                findFieldErrorMessage(payload, 'page'),
                messages.validators.shared.fetchParamShouldBeObject
            );
            t.equal(statusCode, BAD_REQUEST);
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect page size type',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions({ page: { size: 'a', index: 0 } }),
                headers: {
                    authorization: token
                }
            });

            t.equal(
                findFieldErrorMessage(payload, 'page.size'),
                messages.validators.shared.pageSizeShouldBeInteger
            );
            t.equal(statusCode, BAD_REQUEST);
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect page index type',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions({ page: { size: 1, index: 'b' } }),
                headers: {
                    authorization: token
                }
            });

            t.equal(
                findFieldErrorMessage(payload, 'page.index'),
                messages.validators.shared.pageIndexShouldBeInteger
            );
            t.equal(statusCode, BAD_REQUEST);
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect page size value',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions({ page: { size: 0, index: 0 } }),
                headers: {
                    authorization: token
                }
            });

            t.equal(
                findFieldErrorMessage(payload, 'page.size'),
                messages.validators.shared.pageSizeShouldBeCorrectRange
            );
            t.equal(statusCode, BAD_REQUEST);
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect page index value',
        async t => {
            const { adminUser } = seedersData;
            const { token } = await loginAs(app, adminUser.email);

            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions({ page: { size: 1, index: -1 } }),
                headers: {
                    authorization: token
                }
            });

            t.equal(
                findFieldErrorMessage(payload, 'page.index'),
                messages.validators.shared.pageIndexShouldBeCorrectRange
            );
            t.equal(statusCode, BAD_REQUEST);
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns UNAUTHORIZED fetching by not logged in user', async t => {
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject(
            sharedRequestOptions({ page: { size: 2, index: 0 } })
        );

        t.equal(statusCode, UNAUTHORIZED);
        t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
        t.notOk(jwt);
        t.end();
    });
} catch (err) {
    console.error(err);
}

import tap from 'tap';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import loginAs from '~/helpers/loginAs';
import { en as messages } from '~/locales';
import TaskFactory from '~/factories/task';
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
        url: '/trpc/tasks.create'
    } as Partial<InjectOptions>;
    const { OK, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR } =
        StatusCodes;

    type TasksCreateResponse = inferRouterOutputs<AppRouter>['tasks']['create'];

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
        const generatedTask = await TaskFactory.generate();
        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload(generatedTask),
            headers: {
                authorization: token
            }
        });

        const createdTask = extractPayload<TasksCreateResponse>(payload);

        t.equal(statusCode, OK);
        t.ok(createdTask?.id);
        t.equal(createdTask?.title, generatedTask.title);
        t.equal(createdTask?.description, generatedTask.description);
        t.equal(createdTask?.usersStatus.length, 1);
        t.equal(createdTask?.createdById, adminUser.id);
        t.notOk(createdTask?.createdBy);
        t.notOk(createdTask?.updatedById);
        t.ok(jwt);
        t.end();
    });

    tap.test('returns BAD_REQUEST sending empty values ADMIN', async t => {
        const { adminUser } = seedersData;

        const { token } = await loginAs(app, adminUser.email);
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload({
                title: '',
                description: '',
                userIds: []
            }),
            headers: {
                authorization: token
            }
        });

        t.equal(statusCode, BAD_REQUEST);
        t.equal(
            findFieldErrorMessage(payload, 'title'),
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        t.equal(
            findFieldErrorMessage(payload, 'userIds'),
            messages.validators.tasks.userIdsIncorrectAmount
        );
        t.notOk(findFieldErrorMessage(payload, 'description'));
        t.notOk(jwt);
        t.end();
    });

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
                    title: 1,
                    description: [],
                    userIds: false
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'title'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'description'),
                messages.validators.shared.fieldShouldBeString
            );
            t.equal(
                findFieldErrorMessage(payload, 'userIds'),
                messages.validators.shared.fieldShouldBeArray
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns BAD_REQUEST sending incorrect data values as ADMIN',
        async t => {
            const { adminUser } = seedersData;

            const tooManyUuidsArray: string[] = [];

            for (let i = 0; i < 51; i++) {
                tooManyUuidsArray.push(uuidv4());
            }

            const { token } = await loginAs(app, adminUser.email);
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload({
                    title: '1',
                    description: 'x'.repeat(5001),
                    userIds: tooManyUuidsArray
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, BAD_REQUEST);
            t.equal(
                findFieldErrorMessage(payload, 'title'),
                messages.validators.tasks.titleIncorrectLength
            );
            t.equal(
                findFieldErrorMessage(payload, 'description'),
                messages.validators.tasks.descriptionIncorrectLength
            );
            t.equal(
                findFieldErrorMessage(payload, 'userIds'),
                messages.validators.tasks.userIdsIncorrectAmount
            );
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test(
        'returns UNAUTHORZIED sending correct data as logged out',
        async t => {
            const generatedTask = await TaskFactory.generate();
            const {
                statusCode,
                payload,
                headers: { 'x-auth-token': jwt }
            }: FastifyInjectResponseWithOptionalJwt = await app.inject({
                ...sharedRequestOptions,
                payload: preparePayload(generatedTask)
            });

            t.equal(statusCode, UNAUTHORIZED);
            t.equal(findFieldErrorMessage(payload), 'UNAUTHORIZED');
            t.notOk(jwt);
            t.end();
        }
    );

    tap.test('returns FORBIDDEN sending correct data as USER', async t => {
        const { user } = seedersData;

        const { token } = await loginAs(app, user.email);
        const generatedTask = await TaskFactory.generate();
        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions,
            payload: preparePayload(generatedTask),
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
        "returns INTERNAL_SERVER_ERROR sending not existing user's id",
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
                    title: "not existing user's task",
                    description: '',
                    userIds: ['xxxxx-xxxx-xxxx-xxx']
                }),
                headers: {
                    authorization: token
                }
            });

            t.equal(statusCode, INTERNAL_SERVER_ERROR);
            t.equal(
                findFieldErrorMessage(payload, 'userIds'),
                messages.validators.tasks.notAllUsersFromArrayExist
            );
            t.ok(jwt);
            t.end();
        }
    );
} catch (err) {
    console.error(err);
}

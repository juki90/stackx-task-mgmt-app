import tap from 'tap';
import { StatusCodes } from 'http-status-codes';

import app from '~/index';
import initDi from '~/di';
import loginAs from '~/helpers/loginAs';
import TaskFactory from '~/factories/task';
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
    Task,
    ITaskRepository,
    FastifyInjectResponseWithOptionalJwt
} from '~/types';

try {
    let seedersData, allTasks, taskRepository;
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
            url: `/trpc/tasks.fetch${prepareQueryInput(filters)}`
        }) as Partial<InjectOptions>;
    const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;

    type TasksFetchResponse = inferRouterOutputs<AppRouter>['tasks']['fetch'];

    tap.before(async () => {
        const di = await initDi();

        await clearDatabase();

        seedersData = await runSeeders();

        const { adminUser } = seedersData;

        await Promise.all([
            TaskFactory.create(adminUser.email),
            TaskFactory.create(adminUser.email),
            TaskFactory.create(adminUser.email)
        ]);

        taskRepository = di.get<ITaskRepository>('repositories.task');
        allTasks = await taskRepository.findMany({});
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

        const tasks = extractPayload<TasksFetchResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(tasks.rows.length, 2);
        t.ok(jwt);

        tasks.rows.forEach((task: Task) => {
            const precreatedTask = allTasks.find(
                (taskFromAll: Task) => task.id === taskFromAll.id
            );

            precreatedTask.usersStatus.forEach(userStatus => {
                t.ok(userStatus.userId);
                t.notOk(userStatus.doneAt);
            });

            t.equal(task.title, precreatedTask.title);
            t.equal(task.description, precreatedTask.description);
            t.ok(task.id);
            t.ok(task.createdById);
            t.notOk(task.updatedById);
            t.notOk(task.createdBy);
            t.notOk(task.updatedBy);
        });

        t.end();
    });

    tap.test('returns OK fetching matching filter task as ADMIN', async t => {
        const { adminUser } = seedersData;
        const { token } = await loginAs(app, adminUser.email);
        const precreatedTask = await taskRepository.findOne({});

        const {
            statusCode,
            payload,
            headers: { 'x-auth-token': jwt }
        }: FastifyInjectResponseWithOptionalJwt = await app.inject({
            ...sharedRequestOptions({
                page: { size: 2, index: 0 },
                filter: precreatedTask.title
            }),
            headers: {
                authorization: token
            }
        });

        const tasks = extractPayload<TasksFetchResponse>(payload);

        t.equal(statusCode, OK);
        t.equal(tasks.rows.length, 1);
        t.equal(tasks.count, 1);
        t.ok(jwt);

        const [task] = tasks.rows;

        t.equal(task.title, precreatedTask.title);
        t.equal(task.description, precreatedTask.description);
        t.ok(task.id);
        t.ok(task.createdById);
        t.notOk(task.updatedBy);
        t.notOk(task.createdBy);
        t.notOk(task.updatedById);
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

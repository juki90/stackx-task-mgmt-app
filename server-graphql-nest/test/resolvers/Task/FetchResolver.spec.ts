import { ROLE_NAMES } from '@/entities/Role';

import { TASK_STATUSES, type Task } from '@/entities/Task';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('query Tasks > tasks(page: {size,index}, filter)', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;
    let tasksInDb: Task[];

    const gqlSchemaTasks = ` 
        query Tasks($pageData: PageArg!, $filterData: String) {
            tasks(page: $pageData, filter: $filterData) {
                id
                title
                description
                usersStatus {
                    userId
                }
                status
                createdAt
                updatedAt
            }
        }
    `;
    const gqlSchemaTasksWithRelations = ` 
        query Tasks($pageData: PageArg!, $filterData: String) {
            tasks(page: $pageData, filter: $filterData) {
                id
                title
                description
                usersStatus {
                    userId
                }
                status
                createdAt
                updatedAt
                createdBy {
                    id
                    email
                }
                updatedBy {
                    id
                    email
                }
                users {
                    id
                }
            }
        }
    `;

    beforeAll(async () => {
        seederData = await runSeeders();
        tasksInDb = await Promise.all([
            taskFactory.create(),
            taskFactory.create({ description: 'Task that is findable' })
        ]);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns task list sending request as ADMIN', async () => {
        const { user } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { tasks },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(tasks).toHaveLength(2);

        tasks.forEach(task => {
            const taskInDb = tasksInDb.find(({ id }) => task.id === id);

            expect(task.id).toBeDefined();
            expect(task.createdBy).not.toBeDefined();
            expect(task.updatedBy).not.toBeDefined();
            expect(task.users).not.toBeDefined();
            expect(task.title).toEqual(taskInDb.title);
            expect(task.description).toEqual(taskInDb.description);
            expect(task.status).toEqual(taskInDb.status);
            expect(task.usersStatus).toHaveLength(1);
            expect(task.usersStatus[0].userId).toEqual(user.id);
        });

        expect(responseJwt).toBeDefined();
    });

    it('returns no tasks in given pagination sending request as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { tasks },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 1
                }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(tasks).toHaveLength(0);
        expect(responseJwt).toBeDefined();
    });

    it('returns task specified by filter, sending as ADMIN', async () => {
        const { user } = seederData;
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { tasks },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                },
                filterData: 'findable'
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        const [, findableTask] = tasksInDb;

        expect(tasks).toHaveLength(1);

        const [task] = tasks;

        expect(task.id).toBeDefined();
        expect(task.createdBy).not.toBeDefined();
        expect(task.updatedBy).not.toBeDefined();
        expect(task.users).not.toBeDefined();
        expect(task.title).toEqual(findableTask.title);
        expect(task.description).toEqual(findableTask.description);
        expect(task.status).toEqual(TASK_STATUSES.PENDING);
        expect(task.usersStatus).toBeDefined();
        expect(task.usersStatus).toHaveLength(1);
        expect(task.usersStatus[0].userId).toEqual(user.id);
        expect(responseJwt).toBeDefined();
    });

    it('returns tasks with relations, sending as ADMIN', async () => {
        const { adminUser, editableAdmin } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { tasks },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasksWithRelations,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(tasks).toHaveLength(2);

        await taskRepository.update(tasks[1].id, {
            updatedBy: editableAdmin
        });

        tasks.forEach(task => {
            const taskInDb = tasksInDb.find(({ id }) => task.id === id);

            expect(task.id).toBeDefined();
            expect(task.createdBy).toBeDefined();
            expect(task.createdBy.id).toEqual(adminUser.id);
            expect(task.createdBy.email).toEqual(adminUser.email);

            if (task.updatedBy) {
                expect(task.updatedBy).toBeDefined();
                expect(task.updatedBy.id).toEqual(editableAdmin.id);
                expect(task.updatedBy.email).toEqual(editableAdmin.email);
            }

            expect(task.users).toBeDefined();
            expect(task.users).toHaveLength(1);
            expect(task.title).toEqual(taskInDb.title);
            expect(task.description).toEqual(taskInDb.description);
            expect(task.status).toEqual(taskInDb.status);
            expect(task.usersStatus).toHaveLength(1);
            expect(task.usersStatus[0].userId).toEqual(
                taskInDb.usersStatus[0].userId
            );
        });

        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request as USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending no pagination parameters', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: {}
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(errors).toHaveLength(2);

        errors.forEach(error => {
            expect(error.message).toBeDefined();
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending pagination parameters in incorrect types', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: { size: true, index: '' }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(errors).toHaveLength(2);

        errors.forEach(error => {
            expect(error.message).toBeDefined();
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending pagination parameters out of acceptable range', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            jwt,
            variables: {
                pageData: { size: 100, index: -1 }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(findFieldErrorMessage(errors, 'size')).toEqual(
            messages.validators.shared.pageSizeShouldBeCorrectRange
        );

        expect(findFieldErrorMessage(errors, 'index')).toEqual(
            messages.validators.shared.pageIndexShouldBeCorrectRange
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTasks,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ tasks: Task[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

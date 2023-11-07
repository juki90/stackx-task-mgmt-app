import { ROLE_NAMES } from '@/entities/Role';
import { TASK_STATUSES, type Task } from '@/entities/Task';

import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation ChangeTaskStatus > changeTaskStatus(id, changeTaskStatusInput: {status})', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;
    let tasksInDb: Task[];

    const gqlSchemaChangeTaskStatus = ` 
        mutation ChangeTaskStatus($taskId: ID!, $changeTaskStatusInputData: ChangeTaskStatusInput!) {
            changeTaskStatus(id: $taskId, changeTaskStatusInput: $changeTaskStatusInputData) {
                id
                title
                description
                status
                usersStatus {
                    userId
                    doneAt
                }
                createdAt
                updatedAt
            }
        }
    `;

    beforeAll(async () => {
        seederData = await runSeeders();

        const { adminUser, user } = seederData;

        tasksInDb = await Promise.all([
            taskFactory.create({
                userIds: [adminUser.id, user.id]
            }),
            taskFactory.create({ title: 'Task to cancel' }),
            taskFactory.create({ title: 'Another task to cancel' })
        ]);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns task data changing status as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [task] = tasksInDb;

        const {
            data: { changeTaskStatus },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.DONE }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(changeTaskStatus.id).toBeDefined();
        expect(changeTaskStatus.title).toEqual(task.title);
        expect(changeTaskStatus.description).toEqual(task.description);
        expect(changeTaskStatus.status).toEqual(task.status);
        expect(changeTaskStatus.usersStatus).toHaveLength(2);
        expect(
            changeTaskStatus.usersStatus.find(
                userStatus => 'doneAt' in userStatus
            )
        ).toBeTruthy();
        expect(changeTaskStatus).not.toHaveProperty('createdBy');
        expect(changeTaskStatus).not.toHaveProperty('updatedBy');
        expect(changeTaskStatus).not.toHaveProperty('users');
        expect(responseJwt).toBeDefined();
    });

    it('returns task data changing status as main USER, task is marked as DONE', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const [task] = tasksInDb;

        const {
            data: { changeTaskStatus },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.DONE }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(changeTaskStatus.id).toBeDefined();
        expect(changeTaskStatus.title).toEqual(task.title);
        expect(changeTaskStatus.description).toEqual(task.description);
        expect(changeTaskStatus.status).toEqual(TASK_STATUSES.DONE);
        expect(changeTaskStatus.usersStatus).toHaveLength(2);

        changeTaskStatus.usersStatus.forEach(userStatus => {
            expect(userStatus.doneAt).toBeDefined();
        });

        expect(changeTaskStatus).not.toHaveProperty('createdBy');
        expect(changeTaskStatus).not.toHaveProperty('updatedBy');
        expect(changeTaskStatus).not.toHaveProperty('users');
        expect(responseJwt).toBeDefined();
    });

    it('returns task data changing status to cancelled by ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [, , task] = tasksInDb;

        const {
            data: { changeTaskStatus },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.CANCELLED }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(changeTaskStatus.id).toBeDefined();
        expect(changeTaskStatus.title).toEqual(task.title);
        expect(changeTaskStatus.description).toEqual(task.description);
        expect(changeTaskStatus.status).toEqual(TASK_STATUSES.CANCELLED);
        expect(changeTaskStatus.usersStatus).toHaveLength(1);
        expect(changeTaskStatus).not.toHaveProperty('createdBy');
        expect(changeTaskStatus).not.toHaveProperty('updatedBy');
        expect(changeTaskStatus).not.toHaveProperty('users');
        expect(responseJwt).toBeDefined();
    });

    it('return error when sending empty input data', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: {}
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(errors).toHaveLength(1);

        errors.forEach(error => {
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
            expect(error.message).toBeDefined();
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('return error when sending incorrect status type value', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: 'A' }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(errors).toHaveLength(1);

        const [error] = errors;

        expect('code' in error).toBeTruthy();
        expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        expect(error.message).toBeDefined();
        expect(responseJwt).not.toBeDefined();
    });

    it('returns error when sending incorrect status number as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: 5 }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(findFieldErrorMessage(errors, 'status')).toEqual(
            messages.validators.tasks.notAllowedTaskStatus
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error marking as done already done task', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.DONE }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(errors).toHaveLength(1);

        const [error] = errors;

        expect('code' in error).toBeTruthy();
        expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        expect(error.message).toBeDefined();
        expect(responseJwt).toBeDefined();
    });

    it('returns error marking as done cancelled task', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [, task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.DONE }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(errors).toHaveLength(1);

        const [error] = errors;

        expect('code' in error).toBeTruthy();
        expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        expect(error.message).toBeDefined();
        expect(responseJwt).toBeDefined();
    });

    it('returns error cancelling task by USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.DONE }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(errors).toHaveLength(1);

        const [error] = errors;

        expect('code' in error).toBeTruthy();
        expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        expect(error.message).toBeDefined();
        expect(responseJwt).toBeDefined();
    });

    it('returns error when user tries to mark as pending cancelled task', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            jwt,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.PENDING }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(findFieldErrorMessage(errors, 'status')).toEqual(
            messages.validators.tasks.notAllowedTaskStatus
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error requesting by logged out', async () => {
        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaChangeTaskStatus,
            variables: {
                taskId: task.id,
                changeTaskStatusInputData: { status: TASK_STATUSES.DONE }
            }
        })) as SuperTestExecutionResult<{ changeTaskStatus: Task }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

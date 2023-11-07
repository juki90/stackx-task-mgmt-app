import { ROLE_NAMES } from '@/entities/Role';

import type { Task } from '@/entities/Task';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation DeleteTask > deleteTask(id)', () => {
    let tasksInDb: Task[];

    const gqlSchemaDeleteTask = ` 
        mutation DeleteTask($taskId: ID!) {
            deleteTask(id: $taskId) {
                id
                title
                description
                status
                usersStatus {
                    userId
                }
                createdAt
                updatedAt
            }
        }
    `;

    beforeAll(async () => {
        await runSeeders();
        tasksInDb = await Promise.all([
            taskFactory.create(),
            taskFactory.create()
        ]);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns task data sending request as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const [, deletableTask] = tasksInDb;

        const {
            data: { deleteTask },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteTask,
            jwt,
            variables: {
                taskId: deletableTask.id
            }
        })) as SuperTestExecutionResult<{ deleteTask: Task }>;

        expect(deleteTask.id).toBeDefined();
        expect(deleteTask.createdBy).not.toBeDefined();
        expect(deleteTask.updatedBy).not.toBeDefined();
        expect(deleteTask.users).not.toBeDefined();
        expect(deleteTask.title).toEqual(deletableTask.title);
        expect(deleteTask.title).toEqual(deletableTask.title);
        expect(deleteTask.description).toEqual(deletableTask.description);
        expect(deleteTask.status).toEqual(deletableTask.status);
        expect(deleteTask.usersStatus).toBeDefined();
        expect(deleteTask.usersStatus).toHaveLength(1);
        expect(deleteTask.usersStatus[0].userId).toEqual(
            deletableTask.usersStatus[0].userId
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns null sending request against non-existing task as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { deleteTask },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteTask,
            jwt,
            variables: {
                taskId: 'b621df19-7394-464f-9850-7ca808f318bd'
            }
        })) as SuperTestExecutionResult<{ deleteTask: Task }>;

        expect(deleteTask).toBeNull();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request as USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const [{ id: taskId }] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteTask,
            jwt,
            variables: {
                taskId
            }
        })) as SuperTestExecutionResult<{ deleteTask: Task }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const [{ id: taskId }] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteTask,
            variables: {
                taskId
            }
        })) as SuperTestExecutionResult<{ deleteTask: Task }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

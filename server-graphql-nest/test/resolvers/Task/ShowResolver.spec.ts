import { ROLE_NAMES } from '@/entities/Role';

import type { Task } from '@/entities/Task';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('query Task > task(id)', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;
    let tasksInDb: Task[];

    const gqlSchemaTask = ` 
        query Task($taskId: ID!) {
            task(id: $taskId) {
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
    const gqlSchemaTaskWithRelations = ` 
        query Task($taskId: ID!) {
            task(id: $taskId) {
                id
                title
                description
                status
                usersStatus {
                    userId
                }
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
        tasksInDb = await Promise.all([taskFactory.create()]);
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns task sending request as ADMIN', async () => {
        const [task] = tasksInDb;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { task: responseTask },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTask,
            jwt,
            variables: {
                taskId: task.id
            }
        })) as SuperTestExecutionResult<{ task: Task }>;

        expect(responseTask.id).toBeDefined();
        expect(responseTask.createdBy).not.toBeDefined();
        expect(responseTask.updatedBy).not.toBeDefined();
        expect(responseTask.users).not.toBeDefined();
        expect(responseTask.title).toEqual(task.title);
        expect(responseTask.description).toEqual(task.description);
        expect(responseTask.status).toEqual(task.status);
        expect(responseTask.usersStatus).toBeDefined();
        expect(responseTask.usersStatus).toHaveLength(1);
        expect(responseTask.usersStatus[0].userId).toEqual(
            task.usersStatus[0].userId
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns task with relations, sending as ADMIN', async () => {
        const [task] = tasksInDb;
        const { adminUser, editableAdmin } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        await taskRepository.update(task.id, {
            updatedBy: editableAdmin
        });

        const {
            data: { task: responseTask },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTaskWithRelations,
            jwt,
            variables: {
                taskId: task.id
            }
        })) as SuperTestExecutionResult<{ task: Task }>;

        expect(responseTask.id).toBeDefined();
        expect(responseTask.createdBy).toBeDefined();
        expect(responseTask.createdBy.id).toEqual(adminUser.id);
        expect(responseTask.createdBy.email).toEqual(adminUser.email);
        expect(responseTask.updatedBy).toBeDefined();
        expect(responseTask.updatedBy.id).toEqual(editableAdmin.id);
        expect(responseTask.updatedBy.email).toEqual(editableAdmin.email);
        expect(responseTask.users).toBeDefined();
        expect(responseTask.users).toHaveLength(1);
        expect(responseTask.title).toEqual(task.title);
        expect(responseTask.description).toEqual(task.description);
        expect(responseTask.status).toEqual(task.status);
        expect(responseTask.usersStatus).toBeDefined();
        expect(responseTask.usersStatus).toHaveLength(1);
        expect(responseTask.usersStatus[0].userId).toEqual(
            task.usersStatus[0].userId
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request as USER', async () => {
        const [task] = tasksInDb;
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
            gqlSchema: gqlSchemaTask,
            jwt,
            variables: {
                taskId: task.id
            }
        })) as SuperTestExecutionResult<{ task: Task }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error requesting not existing task', async () => {
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
            gqlSchema: gqlSchemaTaskWithRelations,
            jwt,
            variables: {
                taskId: 'b621df19-7394-464f-9850-7ca808f318bd'
            }
        })) as SuperTestExecutionResult<{ task: Task[] }>;

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toEqual(messages.notFound);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('BAD_USER_INPUT');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const [task] = tasksInDb;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaTask,
            variables: {
                taskId: task.id
            }
        })) as SuperTestExecutionResult<{ task: Task[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

import { ROLE_NAMES } from '@/entities/Role';

import type { Task } from '@/entities/Task';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation UpdateTask > updateTask(updateTaskInput: {firstName,lastName,email,password,isAdmin})', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>,
        taskThatWontUpdate: Task | undefined;

    const gqlSchemaUpdateTask = ` 
        mutation UpdateTask($taskId: ID!, $updateTaskInputData: UpdateTaskInput!) {
            updateTask(id: $taskId, updateTaskInput: $updateTaskInputData) {
                id
                title
                description
                status
                usersStatus {
                    userId
                }
                createdBy {
                    id
                }
                updatedBy {
                    id
                }
                users {
                    id
                }
                createdAt
                updatedAt
            }
        }
    `;

    beforeAll(async () => {
        seederData = await runSeeders();
        taskThatWontUpdate = await taskFactory.create();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns task data sending valid data as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const editableTask = await taskFactory.create();
        const generatedTask = await taskFactory.generate();

        const {
            data: { updateTask },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateTask,
            jwt,
            variables: {
                taskId: editableTask.id,
                updateTaskInputData: generatedTask
            }
        })) as SuperTestExecutionResult<{ updateTask: Task }>;

        const { user, adminUser } = seederData;

        expect(updateTask.id).toBeDefined();
        expect(updateTask.title).toEqual(generatedTask.title);
        expect(updateTask.description).toEqual(generatedTask.description);
        expect(updateTask.status).toEqual(editableTask.status);
        expect(updateTask.usersStatus).toHaveLength(1);
        expect(updateTask.usersStatus[0].userId).toEqual(
            editableTask.usersStatus[0].userId
        );
        expect(updateTask).toHaveProperty('createdBy');
        expect(updateTask.createdBy.id).toEqual(adminUser.id);
        expect(updateTask).toHaveProperty('updatedBy');
        expect(updateTask.updatedBy.id).toEqual(adminUser.id);
        expect(updateTask.users).toHaveLength(1);
        expect(updateTask.users[0].id).toEqual(user.id);
        expect('password' in updateTask).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending valid data as USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const generatedTask = await taskFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateTask,
            jwt,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: generatedTask
            }
        })) as SuperTestExecutionResult<{ updateTask: Task }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending no values', async () => {
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
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateTask,
            jwt,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: {}
            }
        })) as SuperTestExecutionResult<{ updateTask: Task }>;

        expect(errors).toHaveLength(3);

        errors.forEach(error => {
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
            expect(error.message).toBeDefined();
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending blank values', async () => {
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
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateTask,
            jwt,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: {
                    title: '',
                    description: '',
                    userIds: []
                }
            }
        })) as SuperTestExecutionResult<{ updateTask: Task }>;

        expect(findFieldErrorMessage(errors, 'title')).toEqual(
            messages.validators.tasks.titleIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'userIds')).toEqual(
            messages.validators.tasks.userIdsIncorrectAmount
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending incorrect data types', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateTask,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: {
                    title: {},
                    description: true,
                    userIds: 1
                }
            }
        });

        expect(errors).toHaveLength(2);

        errors.forEach(error => {
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
            expect('message' in error && error.message).toBeDefined();
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending incorrect values', async () => {
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
        } = await requestExecutor.mutate({
            jwt,
            gqlSchema: gqlSchemaUpdateTask,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: {
                    title: 'toolongstr'.repeat(13),
                    description: 'toolongstr'.repeat(301),
                    userIds: ['not-uuid-string']
                }
            }
        });

        expect(findFieldErrorMessage(errors, 'title')).toEqual(
            messages.validators.tasks.titleIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'description')).toEqual(
            messages.validators.tasks.descriptionIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'userIds')).toEqual(
            messages.validators.shared.fieldShouldBeUuid
        );
        expect(responseJwt).toBeDefined();
    });

    it("returns error sending existing task's email", async () => {
        const { adminUser } = seederData;

        const generatedTask = await taskFactory.generate({
            userIds: [adminUser.id, 'c37bb341-dd4c-40d4-b45b-68882b3e563c']
        });

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
        } = await requestExecutor.mutate({
            jwt,
            gqlSchema: gqlSchemaUpdateTask,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: generatedTask
            }
        });

        expect(findFieldErrorMessage(errors, 'general')).toEqual(
            messages.validators.tasks.notAllUsersFromArrayExist
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request not logged in', async () => {
        const generatedTask = await taskFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateTask,
            variables: {
                taskId: taskThatWontUpdate.id,
                updateTaskInputData: generatedTask
            }
        });

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

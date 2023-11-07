import { ROLE_NAMES } from '@/entities/Role';

import { TASK_STATUSES, type Task } from '@/entities/Task';

import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation CreateTask > createTask(createTaskInput: {title,description,userIds})', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaCreateTask = ` 
        mutation CreateTask($createTaskInputData: CreateTaskInput!) {
            createTask(createTaskInput: $createTaskInputData) {
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
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns task data sending valid data as ADMIN', async () => {
        const { user, adminUser } = seederData;
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const generatedTask = await taskFactory.generate();

        const {
            data: { createTask },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaCreateTask,
            jwt,
            variables: {
                createTaskInputData: generatedTask
            }
        })) as SuperTestExecutionResult<{ createTask: Task }>;

        expect(createTask.id).toBeDefined();
        expect(createTask.title).toEqual(generatedTask.title);
        expect(createTask.description).toEqual(generatedTask.description);
        expect(
            createTask.usersStatus.find(({ userId }) => userId === user.id)
        ).toBeTruthy();
        expect(createTask).toHaveProperty('createdBy');
        expect(createTask.createdBy.id).toEqual(adminUser.id);
        expect(createTask.status).toEqual(TASK_STATUSES.PENDING);
        expect(createTask.updatedBy).toBeNull();
        expect(createTask.users).toBeDefined();
        expect(createTask.users).toHaveLength(1);
        expect(createTask.users[0].id).toEqual(user.id);
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
            gqlSchema: gqlSchemaCreateTask,
            jwt,
            variables: {
                createTaskInputData: generatedTask
            }
        })) as SuperTestExecutionResult<{ createTask: Task }>;

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
            gqlSchema: gqlSchemaCreateTask,
            jwt,
            variables: {
                createTaskInputData: {}
            }
        })) as SuperTestExecutionResult<{ createTask: Task }>;

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
            gqlSchema: gqlSchemaCreateTask,
            jwt,
            variables: {
                createTaskInputData: {
                    title: '',
                    description: '',
                    userIds: []
                }
            }
        })) as SuperTestExecutionResult<{ createTask: Task }>;

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
            gqlSchema: gqlSchemaCreateTask,
            variables: {
                createTaskInputData: {
                    title: false,
                    descriptoin: 1,
                    userIds: ''
                }
            }
        });

        expect(errors).toHaveLength(3);

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
            gqlSchema: gqlSchemaCreateTask,
            variables: {
                createTaskInputData: {
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

    it("returns error sending non existing user's ID", async () => {
        const { editableUser } = seederData;

        const generatedTask = await taskFactory.generate({
            userIds: [editableUser.id, '22888b3a-2651-4908-914d-a344f790cea6']
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
            gqlSchema: gqlSchemaCreateTask,
            variables: {
                createTaskInputData: generatedTask
            }
        });

        expect(findFieldErrorMessage(errors, 'general')).toEqual(
            messages.validators.tasks.notAllUsersFromArrayExist
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending as not logged in', async () => {
        const generatedTask = await taskFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaCreateTask,
            variables: {
                createTaskInputData: generatedTask
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

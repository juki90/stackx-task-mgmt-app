import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/entities/User';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation UpdateUser > updateUser(updateUserInput: {firstName,lastName,email,password,isAdmin})', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaUpdateUser = ` 
        mutation UpdateUser($userId: ID!, $updateUserInputData: UpdateUserInput!) {
            updateUser(id: $userId, updateUserInput: $updateUserInputData) {
                id
                firstName
                lastName
                fullName
                email
                createdBy {
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

    it('returns user data sending valid data as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            editableUser: { id: userId }
        } = seederData;
        const generatedUser = userFactory.generate();

        const {
            data: { updateUser },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateUser,
            jwt,
            variables: {
                userId,
                updateUserInputData: generatedUser
            }
        })) as SuperTestExecutionResult<{ updateUser: User }>;

        const {
            adminUser: { id: createdById }
        } = seederData;

        expect(updateUser.id).toBeDefined();
        expect(updateUser.firstName).toEqual(generatedUser.firstName);
        expect(updateUser.fullName).toEqual(
            `${generatedUser.firstName} ${generatedUser.lastName}`
        );
        expect(updateUser.lastName).toEqual(generatedUser.lastName);
        expect(updateUser.email).toEqual(generatedUser.email);
        expect(updateUser).toHaveProperty('createdBy');
        expect(updateUser.createdBy.id).toEqual(createdById);
        expect('password' in updateUser).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending valid data as USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const {
            editableUser: { id: userId }
        } = seederData;
        const generatedUser = userFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateUser,
            jwt,
            variables: {
                userId,
                updateUserInputData: generatedUser
            }
        })) as SuperTestExecutionResult<{ updateUser: User }>;

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
            editableUser: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateUser,
            jwt,
            variables: {
                userId,
                updateUserInputData: {}
            }
        })) as SuperTestExecutionResult<{ updateUser: User }>;

        expect(errors).toHaveLength(4);

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
            editableUser: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateUser,
            jwt,
            variables: {
                userId,
                updateUserInputData: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    isAdmin: false
                }
            }
        })) as SuperTestExecutionResult<{ updateUser: User }>;

        expect(findFieldErrorMessage(errors, 'firstName')).toEqual(
            messages.validators.users.nameIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'lastName')).toEqual(
            messages.validators.users.nameIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeAnEmail
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending incorrect data types', async () => {
        const {
            editableUser: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateUser,
            variables: {
                userId,
                updateUserInputData: {
                    firstName: true,
                    lastName: [],
                    email: 1,
                    password: {},
                    isAdmin: ''
                }
            }
        });

        expect(errors).toHaveLength(5);

        errors.forEach(error => {
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
            expect('message' in error && error.message).toBeDefined();
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending incorrect values', async () => {
        const {
            editableUser: { id: userId }
        } = seederData;

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
            gqlSchema: gqlSchemaUpdateUser,
            variables: {
                userId,
                updateUserInputData: {
                    firstName: 'I',
                    lastName: 'm',
                    email: '@incorrect.com',
                    password: 'short',
                    isAdmin: false
                }
            }
        });

        expect(findFieldErrorMessage(errors, 'firstName')).toEqual(
            messages.validators.users.nameIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'lastName')).toEqual(
            messages.validators.users.nameIncorrectLength
        );
        expect(findFieldErrorMessage(errors, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeAnEmail
        );
        expect(findFieldErrorMessage(errors, 'password')).toEqual(
            messages.validators.shared.incorrectPasswordLength
        );
        expect(responseJwt).toBeDefined();
    });

    it("returns error sending existing user's email", async () => {
        const {
            editableAdmin: { email },
            editableUser: { id: userId }
        } = seederData;
        const generatedUser = userFactory.generate({ email });

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
            gqlSchema: gqlSchemaUpdateUser,
            variables: {
                userId,
                updateUserInputData: generatedUser
            }
        });

        expect(findFieldErrorMessage(errors, 'email')).toEqual(
            messages.validators.users.userWithThisEmailExists
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error updating admin by whom updater is created', async () => {
        const {
            adminUser: { id: userId }
        } = seederData;
        const generatedUser = userFactory.generate();

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs('editableAdmin');

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            jwt,
            gqlSchema: gqlSchemaUpdateUser,
            variables: {
                userId,
                updateUserInputData: generatedUser
            }
        });
        console.log({ errors: JSON.stringify(errors, null, 4) });

        expect(errors).toHaveLength(1);

        const formError = findFieldErrorMessage(errors, 'general');

        expect(formError).toEqual(
            messages.validators.users.notUpdatableUserByYou
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error when main admin tries to remove his admin role', async () => {
        const {
            adminUser: { id: userId }
        } = seederData;
        const generatedUser = userFactory.generate({
            isAdmin: false
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
            gqlSchema: gqlSchemaUpdateUser,
            variables: {
                userId,
                updateUserInputData: generatedUser
            }
        });

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toEqual(
            messages.validators.users.cantRemoveAdminRole
        );
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('BAD_USER_INPUT');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request not logged in', async () => {
        const {
            adminUser: { id: userId }
        } = seederData;
        const generatedUser = userFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaUpdateUser,
            variables: {
                userId,
                updateUserInputData: generatedUser
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

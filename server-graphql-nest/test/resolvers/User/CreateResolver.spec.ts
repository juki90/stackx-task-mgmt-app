import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/entities/User';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation CreateUser > createUser(createUserInput: {firstName,lastName,email,password,isAdmin})', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaCreateUser = ` 
        mutation CreateUser($createUserInputData: CreateUserInput!) {
            createUser(createUserInput: $createUserInputData) {
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

        const generatedUser = userFactory.generate();

        const {
            data: { createUser },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaCreateUser,
            jwt,
            variables: {
                createUserInputData: generatedUser
            }
        })) as SuperTestExecutionResult<{ createUser: User }>;

        const {
            adminUser: { id: createdById }
        } = seederData;

        expect(createUser.id).toBeDefined();
        expect(createUser.firstName).toEqual(generatedUser.firstName);
        expect(createUser.fullName).toEqual(
            `${generatedUser.firstName} ${generatedUser.lastName}`
        );
        expect(createUser.lastName).toEqual(generatedUser.lastName);
        expect(createUser.email).toEqual(generatedUser.email);
        expect(createUser).toHaveProperty('createdBy');
        expect(createUser.createdBy.id).toEqual(createdById);
        expect('password' in createUser).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending valid data as USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const generatedUser = userFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaCreateUser,
            jwt,
            variables: {
                createUserInputData: generatedUser
            }
        })) as SuperTestExecutionResult<{ createUser: User }>;

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
            gqlSchema: gqlSchemaCreateUser,
            jwt,
            variables: {
                createUserInputData: {}
            }
        })) as SuperTestExecutionResult<{ createUser: User }>;

        expect(errors).toHaveLength(5);

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
            gqlSchema: gqlSchemaCreateUser,
            jwt,
            variables: {
                createUserInputData: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    isAdmin: false
                }
            }
        })) as SuperTestExecutionResult<{ createUser: User }>;

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

    it('returns error sending incorrect data types', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaCreateUser,
            variables: {
                createUserInputData: {
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
            gqlSchema: gqlSchemaCreateUser,
            variables: {
                createUserInputData: {
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
            editableUser: { email }
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
            gqlSchema: gqlSchemaCreateUser,
            variables: {
                createUserInputData: generatedUser
            }
        });

        expect(findFieldErrorMessage(errors, 'email')).toEqual(
            messages.validators.users.userWithThisEmailExists
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending as not logged in', async () => {
        const generatedUser = userFactory.generate();

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaCreateUser,
            variables: {
                createUserInputData: generatedUser
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

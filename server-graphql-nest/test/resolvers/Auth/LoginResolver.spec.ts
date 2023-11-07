import { ROLE_NAMES } from '@/entities/Role';

import type { TRunSeeders } from '../../bootstrap';

describe('mutation Login > login(loginInput: {email,password})', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaLogin = `
        mutation Login($loginInputData: LoginInput!) {
            login(loginInput: $loginInputData) {
                id
                firstName
                lastName
                fullName
                email
                createdAt
                updatedAt
                role {
                    id
                    name
                }
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
        const { adminUser, adminRole } = seederData;
        const {
            data: { login: data },
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        expect(data.id).toEqual(adminUser.id);
        expect(data.firstName).toEqual(adminUser.firstName);
        expect(data.lastName).toEqual(adminUser.lastName);
        expect(data.fullName).toEqual(adminUser.fullName);
        expect(data.email).toEqual(adminUser.email);
        expect(data.role).toBeDefined();
        expect(data.role.name).toEqual(adminRole.name);
        expect('password' in data).toBeFalsy();
        expect(jwt).toBeDefined();
    });

    it('returns user data sending valid data as USER', async () => {
        const { user, userRole } = seederData;
        const {
            data: { login: data },
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        expect(data.id).toEqual(user.id);
        expect(data.firstName).toEqual(user.firstName);
        expect(data.lastName).toEqual(user.lastName);
        expect(data.fullName).toEqual(user.fullName);
        expect(data.email).toEqual(user.email);
        expect(data.role).toBeDefined();
        expect(data.role.name).toEqual(userRole.name);
        expect('password' in data).toBeFalsy();
        expect(jwt).toBeDefined();
    });

    it('returns error sending no values', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaLogin,
            variables: {
                loginInputData: {}
            }
        });

        expect(errors).toHaveLength(2);

        errors.forEach(error => {
            expect(error).toHaveProperty('message');
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending blank values', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaLogin,
            variables: {
                loginInputData: { email: '', password: '' }
            }
        });

        expect(findFieldErrorMessage(errors, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeAnEmail
        );
        expect(findFieldErrorMessage(errors, 'password')).toEqual(
            messages.validators.shared.incorrectPasswordLength
        );
        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending incorrect data types', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaLogin,
            variables: {
                loginInputData: { email: 1, password: true }
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

    it('returns error sending incorrect email format and password length', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaLogin,
            variables: {
                loginInputData: {
                    email: '@example.com',
                    password: 'short'
                }
            }
        });

        expect(findFieldErrorMessage(errors, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeAnEmail
        );
        expect(findFieldErrorMessage(errors, 'password')).toEqual(
            messages.validators.shared.incorrectPasswordLength
        );
        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending not existing email and wrong password', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = await requestExecutor.mutate({
            gqlSchema: gqlSchemaLogin,
            variables: {
                loginInputData: {
                    email: 'unknown@example.com',
                    password: 'validButWrong'
                }
            }
        });

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toEqual(
            messages.validators.auth.incorrectEmailOrPassword
        );
        expect(responseJwt).not.toBeDefined();
    });
});

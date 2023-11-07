import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/entities/User';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('mutation DeleteUser > deleteUser(id)', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaDeleteUser = ` 
        mutation DeleteUser($userId: ID!) {
            deleteUser(id: $userId) {
                id
                firstName
                lastName
                fullName
                email
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

    it('returns user data sending request as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const deletableUser = await userFactory.create();

        const {
            data: { deleteUser },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteUser,
            jwt,
            variables: {
                userId: deletableUser.id
            }
        })) as SuperTestExecutionResult<{ deleteUser: User }>;

        expect(deleteUser.id).toBeDefined();
        expect(deleteUser.firstName).toEqual(deletableUser.firstName);
        expect(deleteUser.fullName).toEqual(
            `${deletableUser.firstName} ${deletableUser.lastName}`
        );
        expect(deleteUser.lastName).toEqual(deletableUser.lastName);
        expect(deleteUser.email).toEqual(deletableUser.email);
        expect('password' in deleteUser).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns null sending request against non-existing user as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { deleteUser },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteUser,
            jwt,
            variables: {
                userId: 'b621df19-7394-464f-9850-7ca808f318bd'
            }
        })) as SuperTestExecutionResult<{ deleteUser: User }>;

        expect(deleteUser).toBeNull();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request as USER', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const {
            user: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteUser,
            jwt,
            variables: {
                userId
            }
        })) as SuperTestExecutionResult<{ deleteUser: User }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error trying to delete admin by whom requestor is created', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs('editableAdmin');

        const {
            adminUser: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteUser,
            jwt,
            variables: {
                userId
            }
        })) as SuperTestExecutionResult<{ deleteUser: User }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('BAD_USER_INPUT');
        expect(errors[0].message).toEqual(
            messages.validators.users.notDeletableUserByYou
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error when main admin tries to delete himself', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            adminUser: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteUser,
            jwt,
            variables: {
                userId
            }
        })) as SuperTestExecutionResult<{ deleteUser: User }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('BAD_USER_INPUT');
        expect(errors[0].message).toEqual(
            messages.validators.users.unableToDeleteYourself
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const {
            user: { id: userId }
        } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.mutate({
            gqlSchema: gqlSchemaDeleteUser,
            variables: {
                userId
            }
        })) as SuperTestExecutionResult<{ deleteUser: User }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

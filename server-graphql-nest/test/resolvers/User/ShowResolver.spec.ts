import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/entities/User';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('query User > user(id)', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaUser = ` 
        query User($userId: ID!) {
            user(id: $userId) {
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
    const gqlSchemaUserWithRelations = ` 
        query User($userId: ID!) {
            user(id: $userId) {
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
                createdBy {
                    id
                    email
                }
                tasks {
                    id
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

    it('returns user sending request as ADMIN', async () => {
        const { user } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { user: responseUser },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUser,
            jwt,
            variables: {
                userId: user.id
            }
        })) as SuperTestExecutionResult<{ user: User }>;

        expect(responseUser.id).toBeDefined();
        expect(responseUser.role).not.toBeDefined();
        expect(responseUser.createdBy).not.toBeDefined();
        expect(responseUser.tasks).not.toBeDefined();
        expect(responseUser.firstName).toEqual(user.firstName);
        expect(responseUser.fullName).toEqual(
            `${user.firstName} ${user.lastName}`
        );
        expect(responseUser.lastName).toEqual(user.lastName);
        expect(responseUser.email).toEqual(user.email);
        expect('password' in responseUser).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns user with relations, sending as ADMIN', async () => {
        const { user, userRole, adminUser } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { user: responseUser },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUserWithRelations,
            jwt,
            variables: {
                userId: user.id
            }
        })) as SuperTestExecutionResult<{ user: User }>;

        expect(responseUser.id).toBeDefined();
        expect(responseUser.role).toBeDefined();
        expect(responseUser.role.id).toEqual(userRole.id);
        expect(responseUser.role.name).toEqual(userRole.name);
        expect(responseUser.createdBy).toBeDefined();
        expect(responseUser.createdBy.id).toEqual(adminUser.id);
        expect(responseUser.createdBy.email).toEqual(adminUser.email);
        expect(responseUser.tasks).toBeDefined();
        expect(responseUser.tasks).toHaveLength(0);
        expect(responseUser.firstName).toEqual(user.firstName);
        expect(responseUser.fullName).toEqual(
            `${user.firstName} ${user.lastName}`
        );
        expect(responseUser.lastName).toEqual(user.lastName);
        expect(responseUser.email).toEqual(user.email);
        expect('password' in responseUser).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request as USER', async () => {
        const { user } = seederData;

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
            gqlSchema: gqlSchemaUser,
            jwt,
            variables: {
                userId: user.id
            }
        })) as SuperTestExecutionResult<{ user: User }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error requesting not existing user', async () => {
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
            gqlSchema: gqlSchemaUserWithRelations,
            jwt,
            variables: {
                userId: 'b621df19-7394-464f-9850-7ca808f318bd'
            }
        })) as SuperTestExecutionResult<{ user: User[] }>;

        expect(errors).toHaveLength(1);
        expect(errors[0].message).toEqual(messages.notFound);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('BAD_USER_INPUT');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const { user } = seederData;

        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUser,
            variables: {
                userId: user.id
            }
        })) as SuperTestExecutionResult<{ user: User[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

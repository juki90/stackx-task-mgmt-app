import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/entities/User';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('query Me > me', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaMe = ` 
        query Me {
            me {
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
    const gqlSchemaMeWithRelations = ` 
        query Me {
            me {
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

    it('returns current user sending request as ADMIN', async () => {
        const { adminUser } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { me },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaMe,
            jwt
        })) as SuperTestExecutionResult<{ me: User }>;

        expect(me.id).toBeDefined();
        expect(me.role).not.toBeDefined();
        expect(me.createdBy).not.toBeDefined();
        expect(me.tasks).not.toBeDefined();
        expect(me.firstName).toEqual(adminUser.firstName);
        expect(me.fullName).toEqual(
            `${adminUser.firstName} ${adminUser.lastName}`
        );
        expect(me.lastName).toEqual(adminUser.lastName);
        expect(me.email).toEqual(adminUser.email);
        expect('password' in me).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns current user with relations, sending as ADMIN', async () => {
        const { editableAdmin, adminRole, adminUser } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs('editableAdmin');

        const {
            data: { me },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaMeWithRelations,
            jwt
        })) as SuperTestExecutionResult<{ me: User }>;

        expect(me.id).toBeDefined();
        expect(me.role).toBeDefined();
        expect(me.role.id).toEqual(adminRole.id);
        expect(me.role.name).toEqual(adminRole.name);
        expect(me.createdBy).toBeDefined();
        expect(me.createdBy.id).toEqual(adminUser.id);
        expect(me.createdBy.email).toEqual(adminUser.email);
        expect(me.tasks).toBeDefined();
        expect(me.tasks).toHaveLength(0);
        expect(me.firstName).toEqual(editableAdmin.firstName);
        expect(me.fullName).toEqual(
            `${editableAdmin.firstName} ${editableAdmin.lastName}`
        );
        expect(me.lastName).toEqual(editableAdmin.lastName);
        expect(me.email).toEqual(editableAdmin.email);
        expect('password' in me).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns current user sending request as USER', async () => {
        const { user } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const {
            data: { me },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaMe,
            jwt
        })) as SuperTestExecutionResult<{ me: User }>;

        expect(me.id).toBeDefined();
        expect(me.role).not.toBeDefined();
        expect(me.createdBy).not.toBeDefined();
        expect(me.tasks).not.toBeDefined();
        expect(me.firstName).toEqual(user.firstName);
        expect(me.fullName).toEqual(`${user.firstName} ${user.lastName}`);
        expect(me.lastName).toEqual(user.lastName);
        expect(me.email).toEqual(user.email);
        expect('password' in me).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns current user with relations, sending as USER', async () => {
        const { user, userRole, adminUser } = seederData;

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.USER);

        const {
            data: { me },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaMeWithRelations,
            jwt
        })) as SuperTestExecutionResult<{ me: User }>;

        expect(me.id).toBeDefined();
        expect(me.role).toBeDefined();
        expect(me.role.id).toEqual(userRole.id);
        expect(me.role.name).toEqual(userRole.name);
        expect(me.createdBy).toBeDefined();
        expect(me.createdBy.id).toEqual(adminUser.id);
        expect(me.createdBy.email).toEqual(adminUser.email);
        expect(me.tasks).toBeDefined();
        expect(me.tasks).toHaveLength(0);
        expect(me.firstName).toEqual(user.firstName);
        expect(me.fullName).toEqual(`${user.firstName} ${user.lastName}`);
        expect(me.lastName).toEqual(user.lastName);
        expect(me.email).toEqual(user.email);
        expect('password' in me).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaMe
        })) as SuperTestExecutionResult<{ me: User[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

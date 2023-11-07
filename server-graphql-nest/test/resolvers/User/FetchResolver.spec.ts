import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/entities/User';
import type { TRunSeeders } from '../../bootstrap';
import type { SuperTestExecutionResult } from 'supertest-graphql';

describe('query Users > users(page: {size,index}, filter)', () => {
    let seederData: Awaited<ReturnType<TRunSeeders>>;

    const gqlSchemaUsers = ` 
        query Users($pageData: PageArg!, $filterData: String) {
            users(page: $pageData, filter: $filterData) {
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
    const gqlSchemaUsersWithRelations = ` 
        query Users($pageData: PageArg!, $filterData: String) {
            users(page: $pageData, filter: $filterData) {
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

    it('returns user list sending request as ADMIN', async () => {
        const { adminUser, user, editableAdmin, editableUser } = seederData;
        const usersInDb = [adminUser, user, editableAdmin, editableUser];

        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { users },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(users).toHaveLength(4);

        users.forEach(user => {
            const userInDb = usersInDb.find(({ id }) => user.id === id);

            expect(user.id).toBeDefined();
            expect(user.role).not.toBeDefined();
            expect(user.createdBy).not.toBeDefined();
            expect(user.tasks).not.toBeDefined();
            expect(user.firstName).toEqual(userInDb.firstName);
            expect(user.fullName).toEqual(`${user.firstName} ${user.lastName}`);
            expect(user.lastName).toEqual(userInDb.lastName);
            expect(user.email).toEqual(userInDb.email);
            expect('password' in user).toBeFalsy();
        });

        expect(responseJwt).toBeDefined();
    });

    it('returns no users in given pagination sending request as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { users },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 1
                }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(users).toHaveLength(0);
        expect(responseJwt).toBeDefined();
    });

    it('returns user specified by filter, sending as ADMIN', async () => {
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { users },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                },
                filterData: 'editable.user'
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        const { editableUser } = seederData;

        expect(users).toHaveLength(1);

        const [user] = users;

        expect(user.id).toBeDefined();
        expect(user.role).not.toBeDefined();
        expect(user.createdBy).not.toBeDefined();
        expect(user.tasks).not.toBeDefined();
        expect(user.firstName).toEqual(editableUser.firstName);
        expect(user.fullName).toEqual(`${user.firstName} ${user.lastName}`);
        expect(user.lastName).toEqual(editableUser.lastName);
        expect(user.email).toEqual(editableUser.email);
        expect('password' in user).toBeFalsy();
        expect(responseJwt).toBeDefined();
    });

    it('returns users with relations, sending as ADMIN', async () => {
        const { adminUser, user, editableAdmin, editableUser } = seederData;
        const usersInDb = [adminUser, user, editableAdmin, editableUser];
        const {
            response: {
                header: { 'x-auth-token': jwt }
            }
        } = await loginAs(ROLE_NAMES.ADMIN);

        const {
            data: { users },
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUsersWithRelations,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(users).toHaveLength(4);

        users.forEach(user => {
            const userInDb = usersInDb.find(({ id }) => user.id === id);

            expect(user.id).toBeDefined();
            expect(user.role).toBeDefined();
            expect(user.role.id).toBeDefined();
            expect(user.role.name).toBeDefined();

            if (user.createdBy) {
                expect(user.createdBy).toBeDefined();
                expect(user.createdBy.id).toEqual(adminUser.id);
                expect(user.createdBy.email).toEqual(adminUser.email);
            }

            expect(user.tasks).toBeDefined();
            expect(user.tasks).toHaveLength(0);
            expect(user.firstName).toEqual(userInDb.firstName);
            expect(user.fullName).toEqual(`${user.firstName} ${user.lastName}`);
            expect(user.lastName).toEqual(userInDb.lastName);
            expect(user.email).toEqual(userInDb.email);
            expect('password' in user).toBeFalsy();
        });

        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request as USER', async () => {
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
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual('FORBIDDEN');
        expect(errors[0].message).toEqual('Forbidden');
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending no pagination parameters', async () => {
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
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: {}
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(errors).toHaveLength(2);

        errors.forEach(error => {
            expect(error.message).toBeDefined();
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending pagination parameters in incorrect types', async () => {
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
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: { size: true, index: '' }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(errors).toHaveLength(2);

        errors.forEach(error => {
            expect(error.message).toBeDefined();
            expect('code' in error).toBeTruthy();
            expect('code' in error && error.code).toEqual('BAD_USER_INPUT');
        });

        expect(responseJwt).not.toBeDefined();
    });

    it('returns error sending pagination parameters out of acceptable range', async () => {
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
            gqlSchema: gqlSchemaUsers,
            jwt,
            variables: {
                pageData: { size: 100, index: -1 }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(findFieldErrorMessage(errors, 'size')).toEqual(
            messages.validators.shared.pageSizeShouldBeCorrectRange
        );

        expect(findFieldErrorMessage(errors, 'index')).toEqual(
            messages.validators.shared.pageIndexShouldBeCorrectRange
        );
        expect(responseJwt).toBeDefined();
    });

    it('returns error sending request by not logged in', async () => {
        const {
            errors,
            response: {
                header: { 'x-auth-token': responseJwt }
            }
        } = (await requestExecutor.query({
            gqlSchema: gqlSchemaUsers,
            variables: {
                pageData: {
                    size: 5,
                    index: 0
                }
            }
        })) as SuperTestExecutionResult<{ users: User[] }>;

        expect(errors).toHaveLength(1);
        expect('code' in errors[0]).toBeTruthy();
        expect('code' in errors[0] && errors[0].code).toEqual(
            'UNAUTHENTICATED'
        );
        expect(errors[0].message).toEqual(messages.loginSessionExpired);
        expect(responseJwt).not.toBeDefined();
    });
});

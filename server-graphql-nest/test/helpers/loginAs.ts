import makeRequest from './requestExecutor';
import { ROLE_NAMES } from '@/entities/Role';

import type { User } from '@/graphql';
import type { Response } from 'express';
import type { SuperTestExecutionResult } from 'supertest-graphql';

export default async (
    role: string = ROLE_NAMES.USER
): Promise<
    SuperTestExecutionResult<User> & {
        data?: {
            login: User;
            response: Response & { header: { 'x-auth-token': string } };
        };
    }
> => {
    const credentials: {
        [role: string]: { email: string; password: string };
    } = {
        admin: {
            email: 'admin@example.test',
            password: '1234abcd'
        },
        user: {
            email: 'user@example.test',
            password: '1234abcd'
        },
        editableAdmin: {
            email: 'editable.admin@example.test',
            password: '1234abcd'
        },
        editableUser: {
            email: 'editable.user@example.test',
            password: '1234abcd'
        }
    };

    return makeRequest.mutate({
        gqlSchema: `
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
                `,
        variables: {
            loginInputData: credentials[role]
        }
    });
};

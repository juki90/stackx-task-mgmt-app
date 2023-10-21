import { ROLE_NAMES } from '@/models/Role';

import type { SuperTest, Test } from 'supertest';

export default async (request: SuperTest<Test>, role = ROLE_NAMES.USER) => {
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
    const response = await request
        .post('/api/auth/login')
        .send(credentials[role]);

    return response;
};

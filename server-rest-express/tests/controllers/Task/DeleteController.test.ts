const { FORBIDDEN, NO_CONTENT, UNAUTHORIZED } = StatusCodes;

describe('TASK DeleteController DELETE /api/tasks/:id', () => {
    beforeAll(async () => {
        await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns NO_CONTENT deleting task as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const taskToDelete = await TaskFactory.create();

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete(`/api/tasks/${taskToDelete.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(NO_CONTENT);
        expect(responseJwt).toBeDefined();
    });

    it('returns NO_CONTENT deleting not existing task as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete('/api/tasks/fb448f71-2615-4a01-a256-d3016c0b754a')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(NO_CONTENT);
        expect(responseJwt).toBeDefined();
    });

    it('returns FORBIDDEN deleting task as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const taskToDelete = await TaskFactory.create();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete(`/api/users/${taskToDelete.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });

    it('returns UNAUTHORIZED deleting when logged out', async () => {
        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete('/api/users/ebe6655b-21cf-443c-8553-d3635ca697a3')
            .send();

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });
});

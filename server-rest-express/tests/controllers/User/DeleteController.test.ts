import type { TRunSeeders } from '../../bootstrap';

const { FORBIDDEN, NO_CONTENT, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('USER DeleteController DELETE /api/users/:id', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns NO_CONTENT deleting user as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const userToDelete = await UserFactory.create({ isAdmin: false });

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete(`/api/users/${userToDelete.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(NO_CONTENT);
        expect(responseJwt).toBeDefined();
    });

    it('returns NO_CONTENT deleting not existing user as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete('/api/users/fb448f71-2615-4a01-a256-d3016c0b754a')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(NO_CONTENT);
        expect(responseJwt).toBeDefined();
    });

    it('returns FORBIDDEN deleting main admin by himself', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser } = seederData;

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete(`/api/users/${adminUser.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
    });

    it('returns FORBIDDEN deleting admin by whom different admin is created', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, 'editableAdmin');
        const { adminUser } = seederData;

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete(`/api/users/${adminUser.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
    });

    it('returns FORBIDDEN deleting user by USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const { editableUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .delete(`/api/users/${editableUser.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });

    it('returns UNAUTHORIZED deleting when logged out', async () => {
        const { editableUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.delete(`/api/users/${editableUser.id}`).send();

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });
});

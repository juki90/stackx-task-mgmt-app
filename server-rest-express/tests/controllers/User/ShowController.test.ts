import type { TRunSeeders } from '../../bootstrap';

const { OK, NOT_FOUND, FORBIDDEN, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('USER ShowController GET /api/users/:id', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK showing any user as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { editableUser, adminUser, userRole } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get(`/api/users/${editableUser.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toBeDefined();
        expect(body.firstName).toEqual(editableUser.firstName);
        expect(body.lastName).toEqual(editableUser.lastName);
        expect(body.email).toEqual(editableUser.email);
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.createdBy).toBeDefined();
        expect(body.roleId).toEqual(userRole.id);
        expect(body.tasks).toHaveLength(0);
    });

    it('returns NOT_FOUND trying to show not existing user', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/users/fb448f71-2615-4a01-a256-d3016c0b754a')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(NOT_FOUND);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Not Found');
    });

    it('returns UNAUTHORIZED showing user by not logged in user', async () => {
        const { editableUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get(`/api/users/${editableUser.id}`).send();

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN showing user by USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const { editableUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get(`/api/users/${editableUser.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

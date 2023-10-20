import type { TRunSeeders } from '../../bootstrap';

const { OK, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('AUTH MeController GET /api/auth/me', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK when logged in as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get('/api/auth/me').send().set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toEqual(adminUser.id);
        expect(body.firstName).toEqual(adminUser.firstName);
        expect(body.lastName).toEqual(adminUser.lastName);
        expect(body.email).toEqual(adminUser.email);
        expect(body.createdById).toEqual(adminUser.createdById);
        expect(body.createdBy).toBeDefined();
        expect(body.roleId).toEqual(adminUser.roleId);
        expect(body.role).not.toBeDefined();
        expect(body.tasks).toHaveLength(0);
    });

    it('returns OK when logged in as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const { user } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get('/api/auth/me').send().set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toEqual(user.id);
        expect(body.firstName).toEqual(user.firstName);
        expect(body.lastName).toEqual(user.lastName);
        expect(body.email).toEqual(user.email);
        expect(body.createdById).toEqual(user.createdById);
        expect(body.createdBy).toBeDefined();
        expect(body.roleId).toEqual(user.roleId);
        expect(body.role).not.toBeDefined();
        expect(body.tasks).toHaveLength(0);
    });

    it('returns UNAUTHORIZED when logged out', async () => {
        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get('/api/auth/me').send();

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });
});

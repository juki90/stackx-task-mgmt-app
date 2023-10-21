import type { Task } from '@/types';
import type { TRunSeeders } from '../../bootstrap';

const { OK, NOT_FOUND, FORBIDDEN, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('TASK ShowController GET /api/users/:id', () => {
    let task: Task;

    beforeAll(async () => {
        seederData = await runSeeders();
        task = await TaskFactory.create();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK showing any task as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser, user } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get(`/api/tasks/${task.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toBeDefined();
        expect(body.title).toEqual(task.title);
        expect(body.description).toEqual(task.description);
        expect(body.usersStatus).toHaveLength(1);
        expect(body.usersStatus[0].userId).toEqual(user.id);
        expect(body.status).toEqual(0);
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.createdBy).toBeDefined();
        expect(body.updatedById).toBeFalsy();
        expect(body.users).toHaveLength(1);
        expect(body.users[0].id).toEqual(user.id);
    });

    it('returns NOT_FOUND trying to show not existing task', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks/fb448f71-2615-4a01-a256-d3016c0b754a')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(NOT_FOUND);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Not Found');
    });

    it('returns UNAUTHORIZED showing task by not logged in user', async () => {
        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get(`/api/tasks/${task.id}`).send();

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN showing task as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const { editableUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get(`/api/tasks/${editableUser.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

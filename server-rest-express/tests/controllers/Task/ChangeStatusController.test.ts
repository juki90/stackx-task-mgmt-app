import type { Task } from '@/types';
import type { TRunSeeders } from '../../bootstrap';

const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('TASKS UpdateController PUT /api/tasks/:id', () => {
    let task: Task, taskToCancel: Task;

    beforeAll(async () => {
        seederData = await runSeeders();

        const { adminUser, user, editableUser } = seederData;

        const createdTasks = await Promise.all([
            TaskFactory.create({
                userIds: [adminUser.id, user.id, editableUser.id]
            }),
            TaskFactory.create({ userIds: [adminUser.id] })
        ]);

        task = createdTasks[0];
        taskToCancel = createdTasks[1];
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK when marking as done by ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 1 })
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
    });

    it('returns OK when marking as done by USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 1 })
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
    });

    it('returns OK when cancelling task by ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${taskToCancel.id}`)
            .send({ status: -1 })
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
    });

    it('returns BAD_REQUEST when sending no status', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'status')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
    });

    it('returns BAD_REQUEST when sending incorrect status type', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 'a' })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'status')).toEqual(
            messages.validators.shared.fieldShouldBeInteger
        );
    });

    it('returns BAD_REQUEST when sending incorrect status number', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 2 })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'status')).toEqual(
            messages.validators.tasks.notAllowedTaskStatus
        );
    });

    it('returns BAD_REQUEST marking as done already done task', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 1 })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual(messages.validators.tasks.alreadyDone);
    });

    it('returns BAD_REQUEST marking as done cancelled task', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 1 })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual(messages.validators.tasks.alreadyDone);
    });

    it('returns BAD_REQUEST when cancelling task by USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: -1 })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual(messages.validators.tasks.onlyAdminCanCancelTask);
    });

    it('returns BAD_REQUEST when user tries to undo done task', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 0 })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'status')).toEqual(
            messages.validators.tasks.notAllowedTaskStatus
        );
    });

    it('returns BAD_REQUEST when user tries to mark as pending cancelled task', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .patch(`/api/tasks/${task.id}`)
            .send({ status: 0 })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'status')).toEqual(
            messages.validators.tasks.notAllowedTaskStatus
        );
    });

    it('returns UNAUTHORIZED sending valid data when logged out', async () => {
        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.patch(`/api/tasks/${task.id}`).send({ status: 1 });

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });
});

import type { Task } from '@/types';
import type { TRunSeeders } from '../../bootstrap';

const { OK, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('TASKS UpdateController PUT /api/tasks/:id', () => {
    let task: Task;

    beforeAll(async () => {
        seederData = await runSeeders();
        task = await TaskFactory.create();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK updating as main ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser, editableUser } = seederData;
        const updateData = await TaskFactory.generate({
            userIds: [editableUser.id]
        });

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/tasks/${task.id}`)
            .send(updateData)
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toEqual(task.id);
        expect(body.title).toEqual(updateData.title);
        expect(body.description).toEqual(updateData.description);
        expect(body.usersStatus).toHaveLength(1);
        expect(body.usersStatus[0].userId).toEqual(editableUser.id);
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.updatedById).toEqual(adminUser.id);
    });

    it('returns BAD_REQUEST sending empty form data as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/tasks/${task.id}`)
            .send({ title: '' })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'title')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        expect(findFieldErrorMessage(body, 'userIds')).toEqual(
            messages.validators.tasks.userIdsIncorrectAmount
        );
    });

    it('returns BAD_REQUEST sending incorrect data types as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/tasks/${task.id}`)
            .send({
                title: 1,
                description: 2,
                userIds: [0]
            })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'title')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'description')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'userIds[0]')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
    });

    it('returns BAD_REQUEST sending incorrect data values as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/tasks/${task.id}`)
            .send({
                title: 'I',
                description: 'loremipsum'.repeat(301),
                userIds: ['abcd-efgh']
            })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'title')).toEqual(
            messages.validators.tasks.titleIncorrectLength
        );
        expect(findFieldErrorMessage(body, 'description')).toEqual(
            messages.validators.tasks.descriptionIncorrectLength
        );
        expect(findFieldErrorMessage(body, 'userIds[0]')).toEqual(
            messages.validators.shared.fieldShouldBeUuid
        );
    });

    it("returns BAD_REQUEST sending not existing user's id", async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const generatedTask = await TaskFactory.generate({
            userIds: ['ebe6655b-21cf-443c-8553-d3635ca697a3']
        });

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/tasks/${task.id}`)
            .send(generatedTask)
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).toBeDefined();
        expect(findFieldErrorMessage(body, 'general')).toEqual(
            messages.validators.tasks.notAllUsersFromArrayExist
        );
    });

    it('returns UNAUTHORIZED sending valid data when logged out', async () => {
        const generatedTask = await TaskFactory.generate();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.put(`/api/tasks/${task.id}`).send(generatedTask);

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN sending valid data as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const generatedTask = await TaskFactory.generate();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/tasks/${task.id}`)
            .send(generatedTask)
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

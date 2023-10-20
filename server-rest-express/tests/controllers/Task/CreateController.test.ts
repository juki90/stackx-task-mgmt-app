import type { TRunSeeders } from '../../bootstrap';

const { CREATED, BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('TASK CreateController POST /api/tasks', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns CREATED sending valid data as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser } = seederData;
        const taskToCreate = await TaskFactory.generate();

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .post('/api/tasks')
            .send(taskToCreate)
            .set('Authorization', jwt);

        expect(status).toEqual(CREATED);
        expect(responseJwt).toBeDefined();
        expect(body.id).toBeDefined();
        expect(body.title).toEqual(taskToCreate.title);
        expect(body.description).toEqual(taskToCreate.description);
        expect(body.usersStatus).toHaveLength(1);
        expect(body.usersStatus[0].userId).toBeDefined();
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.createdBy).not.toBeDefined();
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
            .post('/api/tasks')
            .send({ title: '', description: '', userIds: [] })
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
            .post('/api/tasks')
            .send({
                title: 1,
                description: false,
                userIds: [0, false]
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
        expect(findFieldErrorMessage(body, 'userIds[1]')).toEqual(
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
            .post('/api/tasks')
            .send({
                title: '1',
                description: 'loremipsum'.repeat(301),
                userIds: []
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
        expect(findFieldErrorMessage(body, 'userIds')).toEqual(
            messages.validators.tasks.userIdsIncorrectAmount
        );
    });

    it("returns BAD_REQUEST sending not existing user's id", async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const generatedTask = await TaskFactory.generate({
            userIds: ['34da8031-13d8-4c4c-9637-6214c11bce85']
        });

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .post('/api/tasks')
            .send(generatedTask)
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).toBeDefined();
        expect(findFieldErrorMessage(body, 'general')).toEqual(
            messages.validators.tasks.notAllUsersFromArrayExist
        );
    });

    it('returns UNAUTHORZIED sending correct data as logged out', async () => {
        const taskToCreate = await TaskFactory.generate();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.post('/api/tasks').send(taskToCreate);

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN sending correct data as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const taskToCreate = await TaskFactory.generate();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .post('/api/tasks')
            .send(taskToCreate)
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

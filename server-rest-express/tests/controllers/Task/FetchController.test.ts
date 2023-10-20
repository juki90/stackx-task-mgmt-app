import type { Task } from '@/types';
import type { TRunSeeders } from '../../bootstrap';

const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('TASK FetchController GET /api/tasks?page={"size"=i,"index"=j}&filter=k', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK fetching paginated results as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser, user, editableUser } = seederData;

        const tasksData = [
            { usersStatus: [{ userId: user.id }] },
            { usersStatus: [{ userId: adminUser.id }] },
            { usersStatus: [{ userId: editableUser.id }] },
            {
                usersStatus: [{ userId: user.id }, { userId: editableUser.id }]
            }
        ];

        const tasksInDb: Task[] = [];

        for (const taskData of tasksData) {
            tasksInDb.push(await TaskFactory.create(taskData));
        }

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":2,"index":1}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body).toHaveLength(2);

        body.forEach((resultTask: Task) => {
            const taskInDb = tasksInDb.find(
                dbTask => dbTask.id === resultTask.id
            );

            expect(taskInDb).toBeTruthy();
            expect(resultTask.id).toBeDefined();
            expect(resultTask.title).toEqual(taskInDb.title);
            expect(resultTask.description).toEqual(taskInDb.description);
            expect(resultTask.createdById).toEqual(adminUser.id);
            expect(resultTask.createdBy).not.toBeDefined();
            expect(resultTask.usersStatus).toHaveLength(
                taskInDb.usersStatus.length
            );

            resultTask.usersStatus.forEach(userStatus =>
                expect(userStatus.userId).toBeDefined()
            );
        });
    });

    it('returns OK fetching paginated results with filter as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser, user, editableUser } = seederData;

        const tasksData = [
            { usersStatus: [{ userId: user.id }] },
            { usersStatus: [{ userId: adminUser.id }] },
            {
                title: 'ThisIsUniqueString',
                usersStatus: [{ userId: editableUser.id }]
            }
        ];

        const tasksInDb: Task[] = [];

        for (const taskData of tasksData) {
            tasksInDb.push(await TaskFactory.create(taskData));
        }

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":2,"index":0}&filter=IsUnique')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body).toHaveLength(1);

        const taskInDb = tasksInDb.find(({ id }) => body[0].id === id);

        expect(body[0].id).toBeDefined();
        expect(body[0].title).toEqual('ThisIsUniqueString');
        expect(body[0].description).toEqual(taskInDb.description);
        expect(body[0].createdById).toEqual(adminUser.id);
        expect(body[0].createdBy).not.toBeDefined();
        expect(body[0].usersStatus).toHaveLength(1);
    });

    it('returns BAD_REQUEST skipping query page info as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get('/api/tasks').send().set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
    });

    it('returns BAD_REQUEST sending incorrect page query param type', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page=1')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.fetchParamShouldBeObject
        );
    });

    it('returns BAD_REQUEST sending empty page size', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":"","index":0}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.pageSizeShouldNotBeEmpty
        );
    });

    it('returns BAD_REQUEST sending empty page index', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/users?page={"size": 5,"index":""}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.pageIndexShouldNotBeEmpty
        );
    });

    it('returns BAD_REQUEST sending incorrect page size type', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":{},"index":0}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.pageSizeShouldBeInteger
        );
    });

    it('returns BAD_REQUEST sending incorrect page index type', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/users?page={"size":5,"index":[]}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.pageIndexShouldBeInteger
        );
    });

    it('returns BAD_REQUEST sending incorrect page size value', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":-5,"index":0}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.pageSizeShouldBeCorrectRange
        );
    });

    it('returns BAD_REQUEST sending incorrect page index value', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":10,"index":-5}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'page')).toEqual(
            messages.validators.shared.pageIndexShouldBeCorrectRange
        );
    });

    it('returns UNAUTHORIZED fetching correctly by not logged in user', async () => {
        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get('/api/tasks?page={"size":10,"index":0}').send();

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN fetching correctly as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/tasks?page={"size":10,"index":0}')
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

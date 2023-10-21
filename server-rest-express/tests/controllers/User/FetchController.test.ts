import type { User } from '@/types';
import type { TRunSeeders } from '../../bootstrap';

const { OK, BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('USER FetchController GET /api/users?page={"size"=i,"index"=j}&filter=k', () => {
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
        const { user, adminUser, editableUser, editableAdmin } = seederData;

        const usersInDb = [adminUser, user, editableAdmin, editableUser];

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/users?page={"size":2,"index":0}')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body).toHaveLength(2);

        body.forEach((resultUser: User) => {
            const userInDb = usersInDb.find(
                dbUser => dbUser.id === resultUser.id
            );

            expect(userInDb).toBeTruthy();
            expect(resultUser.id).toBeDefined();
            expect(resultUser.firstName).toEqual(userInDb.firstName);
            expect(resultUser.lastName).toEqual(userInDb.lastName);
            expect(resultUser.fullName).toEqual(
                `${resultUser.firstName} ${resultUser.lastName}`
            );
            expect(resultUser.email).toEqual(userInDb.email);
            expect(resultUser.createdBy).not.toBeDefined();
            expect(resultUser.roleId).toBeDefined();
            expect(resultUser.role).not.toBeDefined();
            expect(resultUser.tasks).not.toBeDefined();
        });
    });

    it('returns OK fetching matching filter user as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { editableUser, adminUser, userRole } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .get('/api/users?page={"size":5,"index":0}&filter=editable.user')
            .send()
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body).toHaveLength(1);
        expect(body[0].firstName).toEqual(editableUser.firstName);
        expect(body[0].lastName).toEqual(editableUser.lastName);
        expect(body[0].fullName).toEqual(
            `${editableUser.firstName} ${editableUser.lastName}`
        );
        expect(body[0].email).toEqual(editableUser.email);
        expect(body[0].createdById).toEqual(adminUser.id);
        expect(body[0].createdBy).not.toBeDefined();
        expect(body[0].roleId).toEqual(userRole.id);
        expect(body[0].role).not.toBeDefined();
        expect(body[0].tasks).not.toBeDefined();
    });

    it('returns BAD_REQUEST skipping query page info as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.get('/api/users').send().set('Authorization', jwt);

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
            .get('/api/users?page=1')
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
            .get('/api/users?page={"size":"","index":0}')
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
            .get('/api/users?page={"size":{},"index":0}')
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
            .get('/api/users?page={"size":-5,"index":0}')
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
            .get('/api/users?page={"size":10,"index":-5}')
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
        } = await request.get('/api/users?page={"size":10,"index":0}').send();

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
            .get('/api/users?page={"size":10,"index":0}')
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

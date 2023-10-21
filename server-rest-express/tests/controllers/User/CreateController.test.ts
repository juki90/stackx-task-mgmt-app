import type { TRunSeeders } from '../../bootstrap';

const { CREATED, BAD_REQUEST, FORBIDDEN, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('USER CreateController POST /api/users', () => {
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
        const { adminUser, adminRole } = seederData;
        const userToCreate = UserFactory.generate({ isAdmin: true });

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .post('/api/users')
            .send(userToCreate)
            .set('Authorization', jwt);

        expect(status).toEqual(CREATED);
        expect(responseJwt).toBeDefined();
        expect(body.id).toBeDefined();
        expect(body.firstName).toEqual(userToCreate.firstName);
        expect(body.lastName).toEqual(userToCreate.lastName);
        expect(body.email).toEqual(userToCreate.email);
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.roleId).toEqual(adminRole.id);
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
            .post('/api/users')
            .send({ firstName: '', lastName: '', email: '', password: '' })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'firstName')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        expect(findFieldErrorMessage(body, 'lastName')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        expect(findFieldErrorMessage(body, 'password')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        expect(findFieldErrorMessage(body, 'isAdmin')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
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
            .post('/api/users')
            .send({
                firstName: 1,
                lastName: false,
                email: 2,
                password: [],
                isAdmin: 'a'
            })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'firstName')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'lastName')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'password')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'isAdmin')).toEqual(
            messages.validators.shared.fieldShouldBeBoolean
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
            .post('/api/users')
            .send({
                firstName: 'I',
                lastName: 'm',
                email: 'incorrect@example.i',
                password: 'short',
                isAdmin: 0
            })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'firstName')).toEqual(
            messages.validators.users.nameIncorrectLength
        );
        expect(findFieldErrorMessage(body, 'lastName')).toEqual(
            messages.validators.users.nameIncorrectLength
        );
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeAnEmail
        );
        expect(findFieldErrorMessage(body, 'password')).toEqual(
            messages.validators.shared.incorrectPasswordLength
        );
        expect(findFieldErrorMessage(body, 'isAdmin')).toEqual(
            messages.validators.shared.fieldShouldBeBoolean
        );
    });

    it("returns BAD_REQUEST sending existing user's email", async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { user } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .post('/api/users')
            .send({
                firstName: 'editable',
                lastName: 'user',
                email: user.email,
                password: '1234abcd',
                isAdmin: false
            })
            .set('Authorization', jwt);

        expect(status).toEqual(BAD_REQUEST);
        expect(responseJwt).not.toBeDefined();
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.users.userWithThisEmailExists
        );
    });

    it('returns UNAUTHORZIED sending correct data as logged out', async () => {
        const userToCreate = UserFactory.generate();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.post('/api/users').send(userToCreate);

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN sending correct data as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const userToCreate = UserFactory.generate();

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .post('/api/users')
            .send(userToCreate)
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

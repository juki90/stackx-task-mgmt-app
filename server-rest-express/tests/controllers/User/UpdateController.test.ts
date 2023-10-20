import type { TRunSeeders } from '../../bootstrap';

const { OK, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('USER UpdateController PUT /api/users/:id', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK updating admin by main ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser, editableAdmin, adminRole } = seederData;

        const updateData = UserFactory.generate({
            ...editableAdmin.dataValues,
            isAdmin: true
        });

        delete updateData.password;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableAdmin.id}`)
            .send(updateData)
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toEqual(editableAdmin.id);
        expect(body.firstName).toEqual(updateData.firstName);
        expect(body.lastName).toEqual(updateData.lastName);
        expect(body.email).toEqual(updateData.email);
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.roleId).toEqual(adminRole.id);
    });

    it('returns OK updating user by ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser, editableUser, userRole } = seederData;
        const updateData = UserFactory.generate({ isAdmin: false });

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableUser.id}`)
            .send(updateData)
            .set('Authorization', jwt);

        expect(status).toEqual(OK);
        expect(responseJwt).toBeDefined();
        expect(body.id).toEqual(editableUser.id);
        expect(body.firstName).toEqual(updateData.firstName);
        expect(body.lastName).toEqual(updateData.lastName);
        expect(body.email).toEqual(updateData.email);
        expect(body.createdById).toEqual(adminUser.id);
        expect(body.roleId).toEqual(userRole.id);
    });

    it('returns BAD_REQUEST sending empty form data as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { editableUser } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableUser.id}`)
            .send({ firstName: '', lastName: '', email: '' })
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
        expect(findFieldErrorMessage(body, 'isAdmin')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
    });

    it('returns BAD_REQUEST sending incorrect data types as ADMIN', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { editableUser } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableUser.id}`)
            .send({
                firstName: 3,
                lastName: 2,
                email: false,
                password: [],
                isAdmin: {}
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
        const { editableUser } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableUser.id}`)
            .send({
                firstName: 'A',
                lastName: 'B',
                email: 'invalid@example.3',
                password: 'short'
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
    });

    it("returns BAD_REQUEST sending existing user's email", async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { user, editableUser } = seederData;

        const {
            body,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableUser.id}`)
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

    it('returns UNAUTHORIZED sending valid data when logged out', async () => {
        const { user } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request.put(`/api/users/${user.id}`).send({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: false
        });

        expect(status).toEqual(UNAUTHORIZED);
        expect(responseJwt).not.toBeDefined();
        expect(text).toEqual(messages.loginSessionExpired);
    });

    it('returns FORBIDDEN when main admin tries to change his role', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${adminUser.id}`)
            .send({
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                email: adminUser.email,
                password: '1234abcd',
                isAdmin: false
            })
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual(messages.validators.users.cantRemoveAdminRole);
    });

    it('returns FORBIDDEN when admin tries to edit admin by whom is created', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, 'editableAdmin');
        const { adminUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${adminUser.id}`)
            .send({
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                email: adminUser.email,
                isAdmin: true
            })
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual(messages.validators.users.notUpdatableUserByYou);
    });

    it('returns FORBIDDEN trying to update user as USER', async () => {
        const {
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const { editableUser } = seederData;

        const {
            text,
            status,
            headers: { 'x-auth-token': responseJwt }
        } = await request
            .put(`/api/users/${editableUser.id}`)
            .send({
                firstName: editableUser.firstName,
                lastName: editableUser.lastName,
                email: editableUser.email,
                isAdmin: false
            })
            .set('Authorization', jwt);

        expect(status).toEqual(FORBIDDEN);
        expect(responseJwt).toBeDefined();
        expect(text).toEqual('Forbidden');
    });
});

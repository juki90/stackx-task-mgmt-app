import type { TRunSeeders } from '../../bootstrap';

const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes;
let seederData: Awaited<ReturnType<TRunSeeders>>;

describe('AUTH LoginController POST /api/auth/login', () => {
    beforeAll(async () => {
        seederData = await runSeeders();
    });

    afterAll(async () => {
        await clearDatabase();
    });

    it('returns OK when properly logging in as ADMIN', async () => {
        const {
            body,
            status,
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.ADMIN);
        const { adminUser } = seederData;

        expect(status).toEqual(OK);
        expect(body.email).toEqual(adminUser.email);
        expect(jwt).toBeDefined();
    });

    it('returns OK when properly logging in as USER', async () => {
        const {
            body,
            status,
            headers: { 'x-auth-token': jwt }
        } = await loginAs(request, ROLE_NAMES.USER);
        const { user } = seederData;

        expect(status).toEqual(OK);
        expect(body.email).toEqual(user.email);
        expect(jwt).toBeDefined();
    });

    it('returns BAD_REQUEST when filling blank form', async () => {
        const { body, status } = await request
            .post('/api/auth/login')
            .send({ email: '', password: '' });

        expect(status).toEqual(BAD_REQUEST);
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
        expect(findFieldErrorMessage(body, 'password')).toEqual(
            messages.validators.shared.fieldShouldNotBeEmpty
        );
    });

    it('returns BAD_REQUEST providing non-string values', async () => {
        const { body, status } = await request
            .post('/api/auth/login')
            .send({ email: 0, password: true });

        expect(status).toEqual(BAD_REQUEST);
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
        expect(findFieldErrorMessage(body, 'password')).toEqual(
            messages.validators.shared.fieldShouldBeString
        );
    });

    it('returns BAD_REQUEST providing too short password and incorrect email', async () => {
        const { body, status } = await request
            .post('/api/auth/login')
            .send({ email: 'a@a.a', password: 'abc123' });

        expect(status).toEqual(BAD_REQUEST);
        expect(findFieldErrorMessage(body, 'email')).toEqual(
            messages.validators.shared.fieldShouldBeAnEmail
        );
        expect(findFieldErrorMessage(body, 'password')).toEqual(
            messages.validators.shared.incorrectPasswordLength
        );
    });

    it('returns UNAUTHORIZED providing not existing email', async () => {
        const { body, status } = await request
            .post('/api/auth/login')
            .send({ email: 'notexisting@example.test', password: '1234abcd' });

        expect(status).toEqual(UNAUTHORIZED);
        expect(findFieldErrorMessage(body, 'general')).toEqual(
            messages.validators.auth.incorrectEmailOrPassword
        );
    });

    it('returns UNAUTHORIZED providing incorrect password', async () => {
        const {
            adminUser: { email }
        } = seederData;

        const { body, status } = await request
            .post('/api/auth/login')
            .send({ email, password: 'validButIncorrectPassword' });

        expect(status).toEqual(UNAUTHORIZED);
        expect(findFieldErrorMessage(body, 'general')).toEqual(
            messages.validators.auth.incorrectEmailOrPassword
        );
    });
});

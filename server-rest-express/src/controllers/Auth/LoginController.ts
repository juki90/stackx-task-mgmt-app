import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpPost,
    response,
    controller
} from 'inversify-express-utils';

import { en as messages } from '@/locales';

import type { Request, Response } from 'express';
import type {
    User,
    IJwt,
    Bcrypt,
    ILogger,
    IUserRepository,
    ILoginController
} from '@/types';

@controller('/auth/login')
export class LoginController implements ILoginController {
    constructor(
        @inject('%bcrypt')
        public bcrypt: Bcrypt,

        @inject('repositories.user')
        public userRepository: IUserRepository,

        @inject('services.jwt')
        public jwt: IJwt,

        @inject('services.logger')
        public logger: ILogger
    ) {}

    @httpPost('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<User | string>> {
        try {
            const {
                body: { email, password }
            } = req;

            const userToCheck = await this.userRepository.findByEmail(email, {
                attributes: ['password']
            });

            if (!userToCheck) {
                return res.status(StatusCodes.UNAUTHORIZED).json([
                    {
                        message:
                            messages.validators.auth.incorrectEmailOrPassword,
                        field: 'general'
                    }
                ]);
            }

            const isValid = await this.bcrypt.compare(
                password,
                userToCheck.password
            );

            if (!isValid) {
                return res.status(StatusCodes.UNAUTHORIZED).json([
                    {
                        message:
                            messages.validators.auth.incorrectEmailOrPassword,
                        field: 'general'
                    }
                ]);
            }

            const userToSend = await this.userRepository.findByEmail(email, {
                include: [{ association: 'role' }]
            });

            const authHeader = this.jwt.sign(userToSend);

            res.setHeader('X-Auth-Token', authHeader);

            return res.send(userToSend);
        } catch (error) {
            this.logger.error(error);

            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(messages.internalServerError);
        }
    }
}

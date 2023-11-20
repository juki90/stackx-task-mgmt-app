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
    IUserRepository,
    ILoginController
} from '@/types';
import { Op } from 'sequelize';

@controller('/auth')
export class LoginController implements ILoginController {
    constructor(
        @inject('%bcrypt')
        public bcrypt: Bcrypt,

        @inject('repositories.user')
        public userRepository: IUserRepository,

        @inject('services.jwt')
        public jwt: IJwt
    ) {}

    @httpPost('/login')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<User | string>> {
        const {
            body: { email, password }
        } = req;

        const userToCheck = await this.userRepository.findByEmail(email, {
            where: { deletedAt: null },
            attributes: ['password']
        });

        if (!userToCheck) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                errors: [
                    {
                        message:
                            messages.validators.auth.incorrectEmailOrPassword,
                        field: 'general'
                    }
                ]
            });
        }

        const isValid = await this.bcrypt.compare(
            password,
            userToCheck.password
        );

        if (!isValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                errors: [
                    {
                        message:
                            messages.validators.auth.incorrectEmailOrPassword,
                        field: 'general'
                    }
                ]
            });
        }

        const userToSend = await this.userRepository.findByEmail(email, {
            where: {
                deletedAt: {
                    [Op.eq]: null
                }
            },
            include: [{ association: 'role' }]
        });
        const authHeader = this.jwt.sign(userToSend);

        res.setHeader('X-Auth-Token', authHeader);

        return res.send(userToSend);
    }
}

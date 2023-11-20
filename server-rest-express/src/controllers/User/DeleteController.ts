import { Op } from 'sequelize';
import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    response,
    httpDelete,
    controller
} from 'inversify-express-utils';

import { en as messages } from '@/locales';

import type { Request, Response } from 'express';
import type { IUserRepository, IUserDeleteController } from '@/types';

@controller('/users')
export class UserDeleteController implements IUserDeleteController {
    constructor(
        @inject('repositories.user')
        public userRepository: IUserRepository
    ) {}

    @httpDelete('/:id')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<string>> {
        const {
            loggedUser,
            params: { id }
        } = req;

        const userToDelete = await this.userRepository.findById(id, {
            where: {
                deletedAt: {
                    [Op.eq]: null
                }
            }
        });

        if (!userToDelete) {
            return res.sendStatus(StatusCodes.NO_CONTENT);
        }

        if (loggedUser.createdById && (await userToDelete.checkAdminRole())) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.notDeletableUserByYou);
        }

        if (loggedUser.id === id) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.unableToDeleteYourself);
        }

        await userToDelete.update({
            deletedAt: new Date()
        });

        return res.sendStatus(StatusCodes.NO_CONTENT);
    }
}

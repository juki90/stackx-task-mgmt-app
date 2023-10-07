import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpDelete,
    response,
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

        const userToDelete = await this.userRepository.findById(id);

        if (!userToDelete) {
            return res.sendStatus(StatusCodes.NO_CONTENT);
        }

        const loggedUserCreatedBy = await loggedUser.getCreatedBy();

        if (loggedUserCreatedBy?.id === userToDelete.id) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.notDeletableUserByYou);
        }

        if (loggedUser.id === id) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.unableToDeleteYourself);
        }

        await userToDelete.destroy();

        return res.sendStatus(StatusCodes.NO_CONTENT);
    }
}

import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpGet,
    response,
    controller
} from 'inversify-express-utils';

import type { Request, Response } from 'express';
import type { User, IUserRepository, IUserShowController } from '@/types';

@controller('/users')
export class UserShowController implements IUserShowController {
    constructor(
        @inject('repositories.user')
        public userRepository: IUserRepository
    ) {}

    @httpGet('/:id')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<User | string>> {
        const {
            params: { id }
        } = req;

        const user = await this.userRepository.findById(id, {
            include: [{ association: 'tasks' }, { association: 'createdBy' }]
        });

        if (!user) {
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        return res.json(user);
    }
}

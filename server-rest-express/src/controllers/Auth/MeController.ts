import { inject } from 'inversify';
import {
    request,
    httpGet,
    response,
    controller
} from 'inversify-express-utils';

import type { Request, Response } from 'express';
import type { User, IUserRepository, IMeController } from '@/types';

@controller('/auth')
export class MeController implements IMeController {
    constructor(
        @inject('repositories.user')
        public userRepository: IUserRepository
    ) {}

    @httpGet('/me')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<User>> {
        const {
            loggedUser: { id }
        } = req;

        const me = await this.userRepository.findById(id, {
            include: [{ association: 'tasks' }, { association: 'createdBy' }]
        });

        return res.json(me);
    }
}

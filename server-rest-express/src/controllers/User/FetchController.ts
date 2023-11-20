import { inject } from 'inversify';
import {
    request,
    httpGet,
    response,
    controller
} from 'inversify-express-utils';

import type { Request, Response } from 'express';
import type { User, IUserRepository, IUserFetchController } from '@/types';

@controller('/users')
export class UserFetchController implements IUserFetchController {
    constructor(
        @inject('repositories.user')
        public userRepository: IUserRepository
    ) {}

    @httpGet('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<{ rows: User[]; count: number }>> {
        const { queryParams } = req;

        const users = await this.userRepository.findAndCount(queryParams);

        return res.json(users);
    }
}

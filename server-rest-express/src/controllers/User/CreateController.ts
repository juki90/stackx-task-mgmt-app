import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpPost,
    response,
    controller
} from 'inversify-express-utils';

import { ROLE_NAMES } from '@/models/Role';
import { USER_UPDATABLE_FIELDS } from '@/models/User';

import type { Request, Response } from 'express';
import type {
    User,
    IUserRepository,
    IRoleRepository,
    IUserCreateController
} from '@/types';

@controller('/users')
export class UserCreateController implements IUserCreateController {
    constructor(
        @inject('repositories.user')
        public userRepository: IUserRepository,

        @inject('repositories.role')
        public roleRepository: IRoleRepository
    ) {}

    @httpPost('/')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<User | string>> {
        const { body: userPayload } = req;

        const [createdUser, adminRole, userRole] = await Promise.all([
            this.userRepository.create(userPayload, {
                fields: USER_UPDATABLE_FIELDS
            }),
            this.roleRepository.findOne({
                where: { name: ROLE_NAMES.ADMIN }
            }),
            this.roleRepository.findOne({
                where: { name: ROLE_NAMES.USER }
            })
        ]);

        const {
            loggedUser,
            body: { isAdmin }
        } = req;

        await Promise.all([
            createdUser.setRole(isAdmin ? adminRole : userRole),
            createdUser.setCreatedBy(loggedUser)
        ]);

        if (createdUser.password) {
            const refetchedUser = await this.userRepository.findById(
                createdUser.id
            );

            return res.status(StatusCodes.CREATED).json(refetchedUser);
        }

        return res.status(StatusCodes.CREATED).json(createdUser);
    }
}

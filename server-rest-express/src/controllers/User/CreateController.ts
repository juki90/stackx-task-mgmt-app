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
    Sequelize,
    IUserRepository,
    IRoleRepository,
    IUserCreateController
} from '@/types';

@controller('/users')
export class UserCreateController implements IUserCreateController {
    constructor(
        @inject('services.sequelize')
        public sequelize: Sequelize,

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
        let createdUser;

        const t = await this.sequelize.transaction();

        try {
            const [user, adminRole, userRole] = await Promise.all([
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

            createdUser = user;

            const {
                loggedUser,
                body: { isAdmin }
            } = req;

            await Promise.all([
                user.setRole(isAdmin ? adminRole : userRole),
                user.setCreatedBy(loggedUser)
            ]);
        } catch (error) {
            await t.rollback();

            throw error;
        }

        if (createdUser?.password) {
            const refetchedUser = await this.userRepository.findById(
                createdUser?.id
            );

            return res.status(StatusCodes.CREATED).json(refetchedUser);
        }

        return res.status(StatusCodes.CREATED).json(createdUser);
    }
}

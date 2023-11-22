import { Op } from 'sequelize';
import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import {
    request,
    httpPut,
    response,
    controller
} from 'inversify-express-utils';

import { en as messages } from '@/locales';
import { ROLE_NAMES } from '@/models/Role';
import {
    USER_UPDATABLE_FIELDS,
    USER_UPDATABLE_FIELDS_NO_PASSWORD
} from '@/models/User';

import type { Request, Response } from 'express';
import type {
    User,
    Sequelize,
    IUserRepository,
    IRoleRepository,
    IUserUpdateController
} from '@/types';

@controller('/users')
export class UserUpdateController implements IUserUpdateController {
    constructor(
        @inject('services.sequelize')
        public sequelize: Sequelize,

        @inject('repositories.user')
        public userRepository: IUserRepository,

        @inject('repositories.role')
        public roleRepository: IRoleRepository
    ) {}

    @httpPut('/:id')
    async invoke(
        @request() req: Request,
        @response() res: Response
    ): Promise<Response<User | string>> {
        const {
            loggedUser,
            params: { id },
            body: userPayload,
            body: { isAdmin, password }
        } = req;

        const userToUpdate = await this.userRepository.findById(id, {
            where: { deletedAt: { [Op.eq]: null } }
        });

        if (!userToUpdate) {
            return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        const [loggedUserCreatedBy, adminRole, userRole] = await Promise.all([
            loggedUser.getCreatedBy(),
            this.roleRepository.findOne({
                where: { name: ROLE_NAMES.ADMIN }
            }),
            this.roleRepository.findOne({
                where: { name: ROLE_NAMES.USER }
            })
        ]);

        if (loggedUserCreatedBy && (await userToUpdate.checkAdminRole())) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.notUpdatableUserByYou);
        }

        if (loggedUserCreatedBy && isAdmin) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.cantAssignUserAdminRole);
        }

        if (
            !loggedUserCreatedBy &&
            !isAdmin &&
            loggedUser.id === userToUpdate.id
        ) {
            return res
                .status(StatusCodes.FORBIDDEN)
                .send(messages.validators.users.cantRemoveAdminRole);
        }

        const t = await this.sequelize.transaction();

        try {
            await userToUpdate.update(userPayload, {
                fields: password
                    ? USER_UPDATABLE_FIELDS
                    : USER_UPDATABLE_FIELDS_NO_PASSWORD
            });

            if (
                isAdmin
                    ? adminRole.id !== userToUpdate.id
                    : userRole.id !== userToUpdate.id
            ) {
                await userToUpdate.setRole(isAdmin ? adminRole : userRole);
            }

            await t.commit();
        } catch (error) {
            await t.rollback();

            throw error;
        }

        const userToSend = await this.userRepository.findById(userToUpdate.id);

        return res.json(userToSend);
    }
}

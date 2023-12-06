import { Injectable } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { en as messages } from '@/locales';
import { ROLE_NAMES } from '@/entities/Role';
import { UserRepository } from '@/repositories/User';
import { RoleRepository } from '@/repositories/Role';
import { UpdateUserInputDto } from '@/dto/User/UpdateDto';

import type { User } from '@/graphql';

@Injectable()
export class UsersUpdateService {
    constructor(
        private userRepository: UserRepository,
        private roleRepository: RoleRepository
    ) {}

    async update(
        id: string,
        updateUserInput: UpdateUserInputDto,
        loggedUser: User
    ): Promise<User> {
        const { isAdmin } = updateUserInput;
        const [userByEmail, userToUpdate] = await Promise.all([
            this.userRepository.findByEmail(updateUserInput.email),
            this.userRepository.findById(id, { relations: { role: true } })
        ]);

        if (!userToUpdate) {
            throw new UserInputError(messages.notFound);
        }

        if (userByEmail && userByEmail.id !== id) {
            throw new UserInputError(
                messages.validators.users.userWithThisEmailExists,
                { field: 'email' }
            );
        }

        const [{ createdBy: loggedUserCreatedBy }, adminRole, userRole] =
            await Promise.all([
                this.userRepository.findOne({
                    where: { id: loggedUser.id },
                    relations: { createdBy: true }
                }),
                this.roleRepository.findOne({
                    where: { name: ROLE_NAMES.ADMIN }
                }),
                this.roleRepository.findOne({
                    where: { name: ROLE_NAMES.USER }
                })
            ]);

        if (
            loggedUserCreatedBy &&
            userToUpdate.role.name === ROLE_NAMES.ADMIN
        ) {
            throw new UserInputError(
                messages.validators.users.notUpdatableUserByYou,
                { field: 'general' }
            );
        }

        if (loggedUserCreatedBy && isAdmin) {
            throw new UserInputError(
                messages.validators.users.cantAssignUserAdminRole,
                { field: 'email' }
            );
        }

        if (
            !loggedUserCreatedBy &&
            !isAdmin &&
            loggedUser.id === userToUpdate.id
        ) {
            throw new UserInputError(
                messages.validators.users.cantRemoveAdminRole
            );
        }

        return this.userRepository.update(id, {
            ...updateUserInput,
            role: isAdmin ? adminRole : userRole
        });
    }
}

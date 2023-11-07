import { Injectable } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { en as messages } from '@/locales';
import { ROLE_NAMES } from '@/entities/Role';
import { UserRepository } from '@/repositories/User';
import { RoleRepository } from '@/repositories/Role';
import { CreateUserInputDto } from '@/dto/User/CreateDto';

import type { User } from '@/graphql';

@Injectable()
export class UsersCreateService {
    constructor(
        private userRepository: UserRepository,
        private roleRepository: RoleRepository
    ) {}

    async create(
        createUserInput: CreateUserInputDto,
        loggerUser: User
    ): Promise<User> {
        const { isAdmin, email } = createUserInput;

        const userByEmail = await this.userRepository.findByEmail(email);

        if (userByEmail) {
            throw new UserInputError(
                messages.validators.users.userWithThisEmailExists,
                { field: 'email' }
            );
        }

        const [adminRole, userRole] = await Promise.all([
            this.roleRepository.findOne({
                where: { name: ROLE_NAMES.ADMIN }
            }),
            this.roleRepository.findOne({
                where: { name: ROLE_NAMES.USER }
            })
        ]);

        let createdUser = await this.userRepository.create({
            ...createUserInput,
            createdBy: loggerUser,
            role: isAdmin ? adminRole : userRole
        });

        if (createdUser.password) {
            createdUser = await this.userRepository.findById(createdUser.id);
        }

        return createdUser;
    }
}
import { Injectable } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { en as messages } from '@/locales';
import { UserRepository } from '@/repositories/User';

import type { User } from '@/graphql';

@Injectable()
export class UsersDeleteService {
    constructor(private userRepository: UserRepository) {}

    async delete(id: string, loggedUser: User): Promise<User | null> {
        const { id: loggedUserId } = loggedUser;

        const userToDelete = await this.userRepository.findById(id);

        if (!userToDelete) {
            return null;
        }

        const { createdBy: loggedUserCreatedBy } =
            await this.userRepository.findOne({
                where: { id: loggedUserId },
                relations: { createdBy: true }
            });

        if (loggedUserCreatedBy?.id === userToDelete.id) {
            throw new UserInputError(
                messages.validators.users.notDeletableUserByYou
            );
        }

        if (loggedUserId === id) {
            throw new UserInputError(
                messages.validators.users.unableToDeleteYourself
            );
        }

        return this.userRepository.update(userToDelete.id, {
            deletedAt: new Date()
        });
    }
}

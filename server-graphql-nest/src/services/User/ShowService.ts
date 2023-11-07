import { Injectable } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';

import { en as messages } from '@/locales';
import { UserRepository } from '@/repositories/User';

import type { User } from '@/graphql';

@Injectable()
export class UsersShowService {
    constructor(private userRepository: UserRepository) {}

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new UserInputError(messages.notFound);
        }

        return user;
    }
}

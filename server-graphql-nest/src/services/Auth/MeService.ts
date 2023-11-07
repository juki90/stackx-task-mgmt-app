import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { UserRepository } from '@/repositories/User';

import type { User } from '@/graphql';

@Injectable()
export class MeService {
    constructor(
        @Inject(forwardRef(() => UserRepository))
        private userRepository: UserRepository
    ) {}

    async me(id: string): Promise<User> {
        return this.userRepository.findOne({
            where: { id },
            relations: {
                tasks: true,
                createdBy: true,
                role: true
            }
        });
    }
}

import { Injectable } from '@nestjs/common';
import { Like, type FindManyOptions } from 'typeorm';

import { UserRepository } from '@/repositories/User';

import type { User, PageArg } from '@/graphql';

@Injectable()
export class UsersFetchService {
    constructor(private userRepository: UserRepository) {}

    async findAll(
        { size, index }: PageArg,
        filter: string
    ): Promise<{ rows: User[]; count: number }> {
        const options: FindManyOptions<User> = {};

        if (filter) {
            options.where = [
                { firstName: Like(`%${filter}%`) },
                { lastName: Like(`%${filter}%`) },
                { email: Like(`%${filter}%`) }
            ];
        }

        options.take = size;
        options.skip = size * index;
        options.order = {
            updatedAt: 'DESC'
        };

        const [rows, count] =
            await this.userRepository.findAllAndCount(options);

        return { rows, count };
    }
}

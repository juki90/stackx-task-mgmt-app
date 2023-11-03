import * as deepMerge from 'deepmerge';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@/entities/User';
import { AbstractRepository } from '@/repositories/abstract';

import type { Repository, FindOneOptions } from 'typeorm';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
    constructor(
        @InjectRepository(User)
        protected readonly repository: Repository<User>
    ) {
        super();
    }

    async findByEmail(email: string, options: FindOneOptions<User> = {}) {
        const finalOptions = deepMerge(options, { where: { email } });

        return this.repository.findOne(finalOptions);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Role } from '@/entities/Role';
import { AbstractRepository } from '@/repositories/Abstract';

import type { Repository } from 'typeorm';

@Injectable()
export class RoleRepository extends AbstractRepository<Role> {
    constructor(
        @InjectRepository(Role)
        protected readonly repository: Repository<Role>
    ) {
        super();
    }
}

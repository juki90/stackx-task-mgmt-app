import { injectable } from 'inversify';

import { AbstractRepository } from '@/repositories/Abstract';

import type { IRoleRepository, Role } from '@/types';
import type { ModelCtor, Repository } from 'sequelize-typescript';

@injectable()
export class RoleRepository
    extends AbstractRepository
    implements IRoleRepository
{
    get repository(): Repository<Role> {
        const { Role } = this.db.models;

        return this.db.getRepository(Role as ModelCtor<Role>);
    }
}

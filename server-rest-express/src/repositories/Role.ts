import { injectable } from 'inversify';

import { AbstractRepository } from '@/repositories/Abstract';

import type { ModelStatic } from 'sequelize';
import type { Role, IRoleRepository } from '@/types';

@injectable()
export class RoleRepository
    extends AbstractRepository<Role>
    implements IRoleRepository
{
    get model(): ModelStatic<Role> {
        return this.db.models.Role as ModelStatic<Role>;
    }
}

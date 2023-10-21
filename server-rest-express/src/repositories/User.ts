import deepMerge from 'deepmerge';
import { injectable } from 'inversify';

import { AbstractRepository } from '@/repositories/Abstract';

import type { User, IUserRepository } from '@/types';
import type { FindOptions, ModelStatic } from 'sequelize';

@injectable()
export class UserRepository
    extends AbstractRepository<User>
    implements IUserRepository
{
    get model(): ModelStatic<User> {
        return this.db.models.User as ModelStatic<User>;
    }

    findByEmail(email: string, options: FindOptions<User> = {}) {
        const finalOptions = deepMerge(options, { where: { email } });

        return this.model.findOne(finalOptions);
    }
}

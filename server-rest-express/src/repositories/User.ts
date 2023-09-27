import { injectable } from 'inversify';

import { AbstractRepository } from '@/repositories/Abstract';

import type { IUserRepository, User } from '@/types';
import type { ModelCtor, Repository } from 'sequelize-typescript';

@injectable()
export class UserRepository
    extends AbstractRepository
    implements IUserRepository
{
    get repository(): Repository<User> {
        const { User } = this.db.models;

        return this.db.getRepository(User as ModelCtor<User>);
    }
}

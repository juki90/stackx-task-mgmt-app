import deepMerge from 'deepmerge';
import { injectable } from 'inversify';

import { AbstractRepository } from '~/repositories/Abstract';

import type { Prisma } from '@prisma/client';
import type { User, IUserRepository } from '~/types';
import type { DefaultArgs } from '@prisma/client/runtime/library';

@injectable()
export class UserRepository
    extends AbstractRepository<Prisma.UserDelegate<DefaultArgs>>
    implements IUserRepository
{
    get model(): Prisma.UserDelegate<DefaultArgs> {
        return this.db.user;
    }

    findByEmail(email: string, options: any = {}): Promise<User | null> {
        const finalOptions = deepMerge(options, { where: { email } });

        return this.model.findFirst(finalOptions) as Promise<User | null>;
    }
}

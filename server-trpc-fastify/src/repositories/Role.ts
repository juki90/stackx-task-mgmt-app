import { injectable } from 'inversify';

import { AbstractRepository } from '~/repositories/Abstract';

import type { Prisma } from '@prisma/client';
import type { IRoleRepository } from '~/types';
import type { DefaultArgs } from '@prisma/client/runtime/library';

@injectable()
export class RoleRepository
    extends AbstractRepository<Prisma.RoleDelegate<DefaultArgs>>
    implements IRoleRepository
{
    get model(): Prisma.RoleDelegate<DefaultArgs> {
        return this.db.role;
    }
}

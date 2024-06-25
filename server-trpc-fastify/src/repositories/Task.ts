import { injectable } from 'inversify';

import { AbstractRepository } from '~/repositories/Abstract';

import type { Prisma } from '@prisma/client';
import type { ITaskRepository } from '~/types';
import type { DefaultArgs } from '@prisma/client/runtime/library';

@injectable()
export class TaskRepository
    extends AbstractRepository<Prisma.TaskDelegate<DefaultArgs>>
    implements ITaskRepository
{
    get model(): Prisma.TaskDelegate<DefaultArgs> {
        return this.db.task;
    }
}

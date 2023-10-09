import { injectable } from 'inversify';

import { AbstractRepository } from '@/repositories/Abstract';

import type { ModelStatic } from 'sequelize';
import type { Task, ITaskRepository } from '@/types';

@injectable()
export class TaskRepository
    extends AbstractRepository<Task>
    implements ITaskRepository
{
    get model(): ModelStatic<Task> {
        return this.db.models.Task as ModelStatic<Task>;
    }
}

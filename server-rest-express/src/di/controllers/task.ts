import { TaskFetchController } from '@/controllers/Task/FetchController';
import { TaskCreateController } from '@/controllers/Task/CreateController';
import { TaskUpdateController } from '@/controllers/Task/UpdateController';
import { TaskDeleteController } from '@/controllers/Task/DeleteController';

import type { Container } from 'inversify';
import type {
    ITaskFetchController,
    ITaskCreateController,
    ITaskUpdateController,
    ITaskDeleteController
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container
        .bind<ITaskFetchController>('controllers.task.fetch')
        .to(TaskFetchController);
    container
        .bind<ITaskCreateController>('controllers.task.create')
        .to(TaskCreateController);
    container
        .bind<ITaskUpdateController>('controllers.task.update')
        .to(TaskUpdateController);
    container
        .bind<ITaskDeleteController>('controllers.task.delete')
        .to(TaskDeleteController);
};

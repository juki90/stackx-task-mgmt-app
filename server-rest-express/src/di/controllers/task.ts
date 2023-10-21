import { TaskFetchController } from '@/controllers/Task/FetchController';
import { TaskShowController } from '@/controllers/Task/ShowController';
import { TaskCreateController } from '@/controllers/Task/CreateController';
import { TaskUpdateController } from '@/controllers/Task/UpdateController';
import { TaskDeleteController } from '@/controllers/Task/DeleteController';
import { TaskChangeStatusController } from '@/controllers/Task/ChangeStatusController';

import type { Container } from 'inversify';
import type {
    ITaskShowController,
    ITaskFetchController,
    ITaskCreateController,
    ITaskUpdateController,
    ITaskDeleteController,
    ITaskChangeStatusController
} from '@/types';

export const useConfig: (container: Container) => void = container => {
    container
        .bind<ITaskFetchController>('controllers.task.fetch')
        .to(TaskFetchController);
    container
        .bind<ITaskShowController>('controllers.task.show')
        .to(TaskShowController);
    container
        .bind<ITaskCreateController>('controllers.task.create')
        .to(TaskCreateController);
    container
        .bind<ITaskUpdateController>('controllers.task.update')
        .to(TaskUpdateController);
    container
        .bind<ITaskDeleteController>('controllers.task.delete')
        .to(TaskDeleteController);
    container
        .bind<ITaskChangeStatusController>('controllers.task.changeStatus')
        .to(TaskChangeStatusController);
};

import { router } from '~/router/trpc';
import { showTaskProcedure } from '~/procedures/tasks/showProcedure';
import { fetchTasksProcedure } from '~/procedures/tasks/fetchProcedure';
import { createTaskProcedure } from '~/procedures/tasks/createProcedure';
import { updateTaskProcedure } from '~/procedures/tasks/updateProcedure';
import { deleteTaskProcedure } from '~/procedures/tasks/deleteProcedure';
import { changeTaskStatusProcedure } from '~/procedures/tasks/changeStatusProcedure';

export const tasksRouter = router({
    show: showTaskProcedure,
    fetch: fetchTasksProcedure,
    create: createTaskProcedure,
    update: updateTaskProcedure,
    delete: deleteTaskProcedure,
    changeStatus: changeTaskStatusProcedure
});

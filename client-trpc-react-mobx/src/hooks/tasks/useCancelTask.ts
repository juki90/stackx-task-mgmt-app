import { useState } from 'react';
import toast from 'react-hot-toast';

import { trpc } from '@/plugins/trpc';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';

import type { ErrorOption } from 'react-hook-form';
import type {
    Task,
    TasksSlice,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
} from '@/types';

export const useCancelTask = () => {
    const trpcUtils = trpc.useUtils();
    const [taskToCancel, setTaskToCancel] = useState<Task | undefined>();
    const [formError, setFormError] = useState<string>('');
    const [otherError, setOtherError] = useState<string>('');

    const setTaskInStore = selectFromStore(
        'task/set'
    ) as TasksSlice['task/set'];
    const setTasksInStore = selectFromStore(
        'tasks/set'
    ) as TasksSlice['tasks/set'];

    const setFormErrorSimple = (key: string, { message }: ErrorOption) =>
        setFormError(message || '');

    const { mutateAsync: cancelTask, reset: resetCancelTaskResponse } =
        trpc.tasks.changeStatus.useMutation();

    const handleCancelTask: (
        payload: TaskChangeStatusRequest
    ) => Promise<TaskChangeStatusResponse | unknown> = async payload => {
        try {
            await cancelTask(payload);

            setTaskInStore(undefined);
            setTasksInStore([]);
            trpcUtils.tasks.fetch.invalidate();
            trpcUtils.tasks.show.invalidate({
                id: taskToCancel?.id
            });
            setTaskToCancel(undefined);
            toast.success(messages.successfullyCancelledTask);
        } catch (error) {
            console.error(error);

            handleServerFormErrors(error, setFormErrorSimple, setOtherError);

            return error;
        }
    };

    const handleCloseCancelDialog = () => {
        setTaskToCancel(undefined);
        setFormError('');
        setOtherError('');
        resetCancelTaskResponse();
    };

    return {
        formError,
        otherError,
        taskToCancel,
        setTaskToCancel,
        handleCancelTask,
        handleCloseCancelDialog
    };
};

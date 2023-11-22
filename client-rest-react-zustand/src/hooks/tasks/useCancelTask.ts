import toast from 'react-hot-toast';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { changeTaskStatus } from '@/api/tasks';
import type {
    Task,
    TasksSlice,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
} from '@/types';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import type { ErrorOption } from 'react-hook-form';

export const useCancelTask = () => {
    const [taskToCancel, setTaskToCancel] = useState<Task | undefined>();
    const [formError, setFormError] = useState<string>('');
    const [otherError, setOtherError] = useState<string>('');

    const setTaskInStore = selectFromStore(
        'task/set'
    ) as TasksSlice['task/set'];
    const setTasksInStore = selectFromStore(
        'tasks/set'
    ) as TasksSlice['tasks/set'];
    const queryClient = useQueryClient();
    const setFormErrorSimple = (key: string, { message }: ErrorOption) =>
        setFormError(message || '');

    const { mutateAsync: handleCancelTask, reset: resetCancelTaskResponse } =
        useMutation({
            async mutationFn(
                payload: TaskChangeStatusRequest
            ): Promise<TaskChangeStatusResponse | unknown> {
                try {
                    await changeTaskStatus(payload);

                    setTaskInStore(undefined);
                    setTasksInStore([]);
                    queryClient.invalidateQueries({
                        queryKey: ['task', taskToCancel?.id]
                    });
                    queryClient.invalidateQueries({
                        queryKey: ['tasks']
                    });
                    setTaskToCancel(undefined);
                    toast.success(messages.successfullyCancelledTask);
                } catch (error) {
                    console.error(error);

                    handleServerFormErrors(
                        error,
                        setFormErrorSimple,
                        setOtherError
                    );

                    return error;
                }
            }
        });

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

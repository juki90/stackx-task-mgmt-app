import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client';

import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { TASKS_FETCH, TASK_CHANGE_STATUS, TASK_SHOW } from '@/graphql/tasks';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';

import type { ErrorOption } from 'react-hook-form';
import type {
    Task,
    TasksSlice,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
} from '@/types';

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
    const setFormErrorSimple = (key: string, { message }: ErrorOption) =>
        setFormError(message || '');

    const [cancelTask, { reset: resetChangeTaskStatusResponse }] = useMutation(
        TASK_CHANGE_STATUS,
        { refetchQueries: [TASK_SHOW, TASKS_FETCH] }
    );

    const handleCancelTask = async ({
        id,
        status
    }: TaskChangeStatusRequest): Promise<
        TaskChangeStatusResponse | unknown
    > => {
        try {
            await cancelTask({
                variables: { id, changeTaskStatusInput: { status } },
                refetchQueries: [TASK_SHOW, TASKS_FETCH]
            });

            setTaskInStore(undefined);
            setTasksInStore([]);
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
        resetChangeTaskStatusResponse();
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

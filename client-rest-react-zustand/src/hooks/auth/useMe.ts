import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { authMe } from '@/api/auth';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { changeTaskStatus } from '@/api/tasks';
import { DATE_FORMAT } from '@/config/constants';
import taskColumns from '@/utilities/taskColumns';

import type {
    Task,
    User,
    AuthSlice,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
} from '@/types';
import type { ErrorOption } from 'react-hook-form';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';

export const useMe = () => {
    const [formError, setFormError] = useState<string>('');
    const [otherError, setOtherError] = useState<string>('');
    const [taskToMarkAsDone, setTaskToMarkAsDone] = useState<Task | null>(null);
    const meInStore = selectFromStore('me') as User | null;
    const setMeInStore = selectFromStore('me/set') as AuthSlice['me/set'];
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const queryClient = useQueryClient();
    const setFormErrorSimple = (key: string, { message }: ErrorOption) =>
        setFormError(message || '');

    const {
        data: responseMe,
        dataUpdatedAt,
        error,
        isError,
        isPending,
        isSuccess,
        refetch
    } = useQuery({
        queryFn: () => authMe(),
        queryKey: ['me'],
        refetchInterval: false,
        enabled: !meInStore
    });

    const me = (meInStore ? meInStore : responseMe) as User | null;

    const {
        mutateAsync: handleMarkTaskAsDone,
        reset: resetMarkTaskAsDoneResponse
    } = useMutation({
        async mutationFn(
            payload: TaskChangeStatusRequest
        ): Promise<TaskChangeStatusResponse | unknown> {
            try {
                await changeTaskStatus(payload);

                setMeInStore(null);
                queryClient.invalidateQueries({
                    queryKey: ['me']
                });
                queryClient.invalidateQueries({
                    queryKey: ['tasks']
                });
                queryClient.invalidateQueries({
                    queryKey: ['task', viewedTask?.id]
                });
                setTaskToMarkAsDone(null);
                await refetch();
                toast.success(messages.successfullyMarkedTaskAsDone);
                setViewedTask(null);
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

    const handleCloseMarkAsDoneDialog = () => {
        setTaskToMarkAsDone(null);
        setFormError('');
        setOtherError('');
        resetMarkTaskAsDoneResponse();
    };

    const meDataRows = useMemo(
        () =>
            me
                ? [
                      ['Full Name', me?.fullName],
                      ['Email', me?.email],
                      ['Joined at', dayjs(me?.createdAt).format(DATE_FORMAT)],
                      ['Updated at', dayjs(me?.updatedAt).format(DATE_FORMAT)]
                  ]
                : [],

        [me?.updatedAt]
    );

    const handleRefetch = async () => {
        try {
            setIsRefetchDisabled(true);

            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setMeInStore(data.data as User);
            toast.success(messages.successfullyRefetchedData);
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    useEffect(() => {
        if (isError) {
            console.error(error);
            toast.error(messages.internalServerError);
        }
    }, [isError]);

    useEffect(() => {
        if (isSuccess && responseMe) {
            setMeInStore(responseMe);
        }
    }, [isSuccess]);

    useEffect(() => {
        if (isRefetchDisabled) {
            const timeout = setTimeout(
                () => setIsRefetchDisabled(false),
                5 * 1000
            );

            return () => clearTimeout(timeout);
        }
    }, [isRefetchDisabled]);

    return {
        me,
        isError,
        isSuccess,
        isPending,
        viewedTask,
        meDataRows,
        taskColumns,
        dataUpdatedAt,
        isRefetchDisabled,
        markAsDoneProps: {
            formError,
            otherError,
            taskToMarkAsDone,
            setTaskToMarkAsDone,
            handleMarkTaskAsDone,
            handleCloseMarkAsDoneDialog
        },
        handleRefetch,
        setViewedTask
    };
};

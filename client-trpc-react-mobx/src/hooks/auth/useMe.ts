import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useContext, useEffect, useMemo, useState } from 'react';

import { trpc } from '@/plugins/trpc';
import { en as messages } from '@/locales';
import { RootStore } from '@/context/RootStore';
import { DATE_FORMAT } from '@/config/constants';
import taskColumns from '@/utilities/taskColumns';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';

import type { ErrorOption } from 'react-hook-form';
import type {
    Task,
    User,
    TaskChangeStatusRequest,
    TaskChangeStatusResponse
} from '@/types';

export const useMe = () => {
    const trpcUtils = trpc.useUtils();
    const { authStore } = useContext(RootStore);
    const [formError, setFormError] = useState<string>('');
    const [otherError, setOtherError] = useState<string>('');
    const [taskToMarkAsDone, setTaskToMarkAsDone] = useState<Task | null>(null);
    const { me: meInStore, setMe: setMeInStore } = authStore;
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const setFormErrorSimple = (key: string, { message }: ErrorOption) =>
        setFormError(message || '');

    const {
        data: responseMe,
        dataUpdatedAt,
        error,
        isError,
        isSuccess,
        isInitialLoading: isLoading,
        refetch
    } = trpc.auth.me.useQuery(undefined, {
        refetchInterval: false,
        enabled: !meInStore
    });

    const me = (meInStore ? meInStore : responseMe) as User | null;

    const {
        mutateAsync: changeTaskStatus,
        reset: resetMarkTaskAsDoneResponse
    } = trpc.tasks.changeStatus.useMutation();

    const handleMarkTaskAsDone: (
        payload: TaskChangeStatusRequest
    ) => Promise<TaskChangeStatusResponse | unknown> = async (
        payload: TaskChangeStatusRequest
    ) => {
        try {
            await changeTaskStatus(payload);
            setMeInStore(undefined);
            trpcUtils.auth.me.invalidate();
            trpcUtils.tasks.fetch.invalidate();
            trpcUtils.tasks.show.invalidate({
                id: viewedTask?.id
            });
            setTaskToMarkAsDone(null);
            await refetch();
            toast.success(messages.successfullyMarkedTaskAsDone);
            setViewedTask(null);
        } catch (error) {
            console.error(error);
            handleServerFormErrors(error, setFormErrorSimple, setOtherError);

            return error;
        }
    };

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
            setMeInStore(responseMe as User);
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
        isLoading,
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

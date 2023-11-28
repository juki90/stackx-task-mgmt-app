import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, NetworkStatus } from '@apollo/client';

import { ME } from '@/graphql/auth';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { DATE_FORMAT } from '@/config/constants';
import taskColumns from '@/utilities/taskColumns';
import { TASK_CHANGE_STATUS } from '@/graphql/tasks';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';

import type { ErrorOption } from 'react-hook-form';
import type { Task, User, AuthSlice } from '@/types';

export const useMe = () => {
    const [formError, setFormError] = useState<string>('');
    const [otherError, setOtherError] = useState<string>('');
    const [taskToMarkAsDone, setTaskToMarkAsDone] = useState<Task | null>(null);
    const meInStore = selectFromStore('me') as User | null;
    const loggedUser = selectFromStore('loggedUser') as User | null;
    const setMeInStore = selectFromStore('me/set') as AuthSlice['me/set'];
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [fetchedAt, setFetchedAt] = useState('');
    const setFormErrorSimple = (key: string, { message }: ErrorOption) =>
        setFormError(message || '');

    const {
        error,
        data: responseMe,
        networkStatus: fetchStatus,
        refetch
    } = useQuery(ME, {
        skip: !!meInStore,
        notifyOnNetworkStatusChange: true
    });

    const me = (meInStore ? meInStore : responseMe) as User | null;

    const [markAsDone, { reset: resetMarkTaskAsDoneResponse }] =
        useMutation(TASK_CHANGE_STATUS);

    const handleMarkTaskAsDone = async (id: string) => {
        try {
            await markAsDone({
                variables: { id, changeTaskStatusInput: { status: 1 } }
            });

            setMeInStore(null);
            setTaskToMarkAsDone(null);
            setIsRefetching(true);
            await refetch({ fetchPolicy: 'network-only' });
            setIsRefetching(false);
            toast.success(messages.successfullyMarkedTaskAsDone);
            setViewedTask(null);
        } catch (error) {
            console.error(error);
            setIsRefetching(false);
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
            setIsRefetching(true);

            const data = await refetch({
                awaitRefetchQueries: true
            });

            setIsRefetching(false);
            if (data.error) {
                throw data.error;
            }

            setFetchedAt(dayjs().format(DATE_FORMAT));
            setMeInStore(data?.data?.me as User);
            toast.success(messages.successfullyRefetchedData);
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    useEffect(() => {
        if (fetchStatus === NetworkStatus.error && error) {
            console.error(error);
            toast.error(messages.internalServerError);
        }

        if (fetchStatus === NetworkStatus.ready && responseMe?.me) {
            setMeInStore(responseMe.me);
            setFetchedAt(dayjs().format(DATE_FORMAT));
        }
    }, [fetchStatus]);

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
        fetchedAt,
        viewedTask,
        meDataRows,
        loggedUser,
        fetchStatus,
        taskColumns,
        isRefetching,
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

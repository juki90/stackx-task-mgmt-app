import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { authMe } from '@/api/auth';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import taskColumns from '@/utilities/taskColumns';

import type { Task, User, AuthSlice } from '@/types';
import { DATE_FORMAT } from '@/config/constants';

export const useMe = () => {
    const meInStore = selectFromStore('me') as User;
    const setMeInStore = selectFromStore('me/set') as AuthSlice['me/set'];
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);

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
        handleRefetch,
        setViewedTask
    };
};

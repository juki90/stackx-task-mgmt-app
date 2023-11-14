import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { authMe } from '@/api/auth';
import { en as messages } from '@/locales';
import { DATE_FORMAT } from '@/config/constants';

import type { Task } from '@/types';
import type { GridValueGetterParams } from '@mui/x-data-grid';

export const useMe = () => {
    const [viewedTask, setViewedTask] = useState<Task | null>(null);
    const {
        data: me,
        dataUpdatedAt,
        error,
        isError,
        isPending,
        isSuccess,
        refetch
    } = useQuery({
        queryFn: () => authMe(),
        queryKey: ['me'],
        refetchInterval: false
    });

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

    const taskColumns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'title', headerName: 'Title', width: 260 },
        { field: 'description', headerName: 'Description', width: 260 },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            valueGetter: ({ row }: GridValueGetterParams) => {
                const statuses = ['CANCELLED', 'PENDING', 'DONE'];

                return statuses[row.status + 1];
            }
        },
        {
            field: 'usersStatus',
            headerName: 'Done by',
            width: 100,
            valueGetter: ({ row }: GridValueGetterParams) => {
                const numberOfUsersFinishedTask = row.usersStatus.filter(
                    ({ doneAt }: { userId: string; doneAt: string }) => doneAt
                ).length;

                return `${numberOfUsersFinishedTask}/${row.usersStatus.length}`;
            }
        },
        {
            field: 'createdAt',
            headerName: 'Created at',
            width: 160,
            valueGetter: ({ row }: GridValueGetterParams) =>
                dayjs(row.createdAt).format(DATE_FORMAT)
        },
        {
            field: 'updatedAt',
            headerName: 'Updated at',
            width: 160,
            valueGetter: ({ row }: GridValueGetterParams) =>
                dayjs(row.updatedAt).format(DATE_FORMAT)
        }
    ];

    const handleRefetch = async () => {
        try {
            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

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

    return {
        me,
        isError,
        isSuccess,
        isPending,
        viewedTask,
        meDataRows,
        dataUpdatedAt,
        taskColumns,
        handleRefetch,
        setViewedTask
    };
};

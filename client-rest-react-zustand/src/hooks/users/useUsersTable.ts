import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchUsers } from '@/api/users';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { DATE_FORMAT } from '@/config/constants';
import { useDebounce } from '@/hooks/useDebounce';

import type { GridValueGetterParams } from '@mui/x-data-grid';
import type { User, UsersSlice, PaginationInfo } from '@/types';

export const useUsersTable = () => {
    const usersInStore = selectFromStore('users') as User[];
    const paginationInStore = selectFromStore(
        'userPagination'
    ) as PaginationInfo;
    const setUserPaginationInStore = selectFromStore(
        'userPagination/set'
    ) as UsersSlice['userPagination/set'];
    const setUsersInStore = selectFromStore(
        'users/set'
    ) as UsersSlice['users/set'];
    const [viewedUser, setViewedUser] = useState<User | null | undefined>(null);
    const [usersPage, setUsersPage] = useState(
        paginationInStore
            ? { size: paginationInStore.size, index: paginationInStore.index }
            : {
                  size: 10,
                  index: 0
              }
    );
    const [usersFilter, setUsersFilter] = useState('');
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [isCreateOrUpdateModalOpen, setIsCreateOrUpdateModalOpen] =
        useState(false);

    const {
        data: responseUsers,
        error: responseUsersError,
        isError: isResponseUsersFailed,
        isRefetching: isUsersRefetching,
        isPending: isResponseUsersPending,
        isSuccess: isResponseUsersSuccess,
        dataUpdatedAt: responseUsersUpdatedAt,
        refetch
    } = useQuery({
        queryFn: () =>
            fetchUsers({
                page: usersPage,
                filter: usersFilter
            }),
        queryKey: ['users'],
        refetchInterval: false,
        enabled: !usersInStore?.length
    });

    const users = (
        usersInStore?.length ? usersInStore : responseUsers?.rows
    ) as User[];
    const pagination = paginationInStore
        ? paginationInStore
        : { ...usersPage, total: responseUsers?.count || 0 };

    const usersColumns = [
        { field: 'id', headerName: 'ID', width: 120 },
        { field: 'firstName', headerName: 'First name', width: 160 },
        { field: 'lastName', headerName: 'Last name', width: 160 },
        { field: 'email', headerName: 'Email', width: 320 },
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

    const handleRefetchUsers = async () => {
        try {
            setIsRefetchDisabled(true);

            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setUsersInStore(data?.data?.rows as User[]);
            setUserPaginationInStore({
                size: usersPage.size,
                index: usersPage.index,
                total: data?.data?.count || 0
            });
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    const handleRefetchByFilterOrOnPaginationChange = async ({
        size,
        index
    }: {
        size: number;
        index: number;
    }) => {
        try {
            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setUsersInStore(data?.data?.rows as User[]);
            setUserPaginationInStore({
                size,
                index,
                total: data.data?.count || 0
            });
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToQueryWithFilter);
        }
    };

    useEffect(() => {
        if (isResponseUsersFailed) {
            console.error(responseUsersError);

            toast.error(messages.internalServerError);
        }
    }, [isResponseUsersFailed]);

    useEffect(() => {
        if (isResponseUsersSuccess && responseUsers) {
            setUsersInStore(responseUsers.rows);
            setUserPaginationInStore({
                ...pagination,
                total: responseUsers.count
            });
        }
    }, [isResponseUsersSuccess]);

    useEffect(() => {
        if (isRefetchDisabled) {
            const timeout = setTimeout(
                () => setIsRefetchDisabled(false),
                5 * 1000
            );

            return () => clearTimeout(timeout);
        }
    }, [isRefetchDisabled]);

    useEffect(() => {
        const { size, index } = usersPage;

        if (
            paginationInStore?.size !== size ||
            paginationInStore?.index !== index
        ) {
            handleRefetchByFilterOrOnPaginationChange({
                index,
                size
            });
        }
    }, [usersPage.size, usersPage.index]);

    useDebounce(usersFilter, () =>
        handleRefetchByFilterOrOnPaginationChange(pagination)
    );

    return {
        users,
        pagination,
        viewedUser,
        usersFilter,
        usersColumns,
        isUsersRefetching,
        isRefetchDisabled,
        isResponseUsersFailed,
        isResponseUsersPending,
        isResponseUsersSuccess,
        responseUsersUpdatedAt,
        isCreateOrUpdateModalOpen,
        setUsersPage,
        setViewedUser,
        setUsersFilter,
        handleRefetchUsers,
        setIsCreateOrUpdateModalOpen,
        handleRefetchByFilterOrOnPaginationChange
    };
};

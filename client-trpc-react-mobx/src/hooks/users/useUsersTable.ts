import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useState, useEffect, useContext } from 'react';

import { trpc } from '@/plugins/trpc';
import { en as messages } from '@/locales';
import { RootStore } from '@/context/RootStore';
import { DATE_FORMAT } from '@/config/constants';
import { useDebounce } from '@/hooks/useDebounce';

import type { User } from '@/types';
import type { GridValueGetterParams } from '@mui/x-data-grid';

export const useUsersTable = () => {
    const { usersStore } = useContext(RootStore);
    const {
        users: usersInStore,
        userPagination: paginationInStore,
        setUserPagination: setUserPaginationInStore,
        setUsers: setUsersInStore
    } = usersStore;
    const [viewedUser, setViewedUser] = useState<User | undefined>();
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
        isInitialLoading: isResponseUsersPending,
        isSuccess: isResponseUsersSuccess,
        dataUpdatedAt: responseUsersUpdatedAt,
        refetch
    } = trpc.users.fetch.useQuery(
        {
            page: { size: usersPage.size, index: usersPage.index },
            filter: usersFilter
        },
        {
            refetchInterval: false,
            enabled: !usersInStore?.length
        }
    );

    const users = usersInStore?.length ? usersInStore : responseUsers?.rows;
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
            toast.success(messages.successfullyRefetchedData);
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
            setUsersInStore(responseUsers.rows as User[]);
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

import dayjs from 'dayjs';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { NetworkStatus, useQuery } from '@apollo/client';

import { en as messages } from '@/locales';
import { USERS_FETCH } from '@/graphql/users';
import { DATE_FORMAT } from '@/config/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { userPaginationAtom, usersAtom } from '@/atoms/users';

import type { User } from '@/types';
import type { GridValueGetterParams } from '@mui/x-data-grid';

export const useUsersTable = () => {
    const [usersInStore, setUsersInStore] = useAtom(usersAtom);
    const [paginationInStore, setUserPaginationInStore] =
        useAtom(userPaginationAtom);
    const [isRefetching, setIsRefetching] = useState(false);
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
    const [fetchedAt, setFetchedAt] = useState('');

    const {
        data: responseUsers,
        error: responseError,
        networkStatus: fetchStatus,
        refetch
    } = useQuery(USERS_FETCH, {
        skip: !!usersInStore?.length,
        variables: {
            pageData: usersPage,
            filterData: usersFilter
        }
    });

    const users = (
        usersInStore?.length ? usersInStore : responseUsers?.users?.rows
    ) as User[];
    const pagination = paginationInStore
        ? paginationInStore
        : { ...usersPage, total: responseUsers?.users?.count || 0 };

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
            setIsRefetching(true);

            const data = await refetch();

            setIsRefetching(false);

            if (data.error) {
                throw data.error;
            }

            setUsersInStore(data?.data?.users?.rows as User[]);
            setUserPaginationInStore({
                size: usersPage.size,
                index: usersPage.index,
                total: data?.data?.count || 0
            });
            setFetchedAt(dayjs().format(DATE_FORMAT));
        } catch (error) {
            console.error(error);
            setIsRefetching(false);
            toast.error(messages.failedToRefetchedData);

            return error;
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
            setIsRefetching(true);

            const data = await refetch();

            setIsRefetching(false);

            if (data.error) {
                throw data.error;
            }

            setUsersInStore(data?.data?.users?.rows as User[]);
            setUserPaginationInStore({
                size,
                index,
                total: data.data?.users?.count || 0
            });
            setFetchedAt(dayjs().format(DATE_FORMAT));
        } catch (error) {
            console.error(error);
            setIsRefetching(false);
            toast.error(messages.failedToQueryWithFilter);
        }
    };

    useEffect(() => {
        if (fetchStatus === NetworkStatus.ready && responseUsers) {
            setUsersInStore(responseUsers.users?.rows);
            setUserPaginationInStore({
                ...pagination,
                total: responseUsers?.users?.count
            });
            setFetchedAt(dayjs().format(DATE_FORMAT));
        }

        if (fetchStatus === NetworkStatus.error && responseError) {
            console.error(responseError);

            toast.error(messages.internalServerError);
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
        fetchedAt,
        pagination,
        viewedUser,
        fetchStatus,
        usersFilter,
        isRefetching,
        usersColumns,
        isRefetchDisabled,
        isCreateOrUpdateModalOpen,
        setUsersPage,
        setViewedUser,
        setUsersFilter,
        handleRefetchUsers,
        setIsCreateOrUpdateModalOpen,
        handleRefetchByFilterOrOnPaginationChange
    };
};

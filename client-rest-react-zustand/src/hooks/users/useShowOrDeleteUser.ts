import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient
} from '@tanstack/react-query';

import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import * as sharedErrorsHandlers from '@/helpers/sharedErrorsHandlers';
import { showUser, deleteUser as deleteUserApi } from '@/api/users';

import type {
    User,
    AuthSlice,
    UsersSlice,
    UserDeleteRequest,
    UserDeleteResponse
} from '@/types';

export const useShowOrDeleteUser = (
    viewedUserId: string | null | undefined,
    setViewedUser: (user: User | null) => void
) => {
    const queryClient = useQueryClient();
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [showUserOtherErrorMessage, setShowUserOtherErrorMessage] =
        useState('');
    const [deleteUserOtherErrorMessage, setDeleteUserOtherErrorMessage] =
        useState('');
    const userInStore = selectFromStore('user') as User;
    const setUserInStore = selectFromStore(
        'user/set'
    ) as UsersSlice['user/set'];
    const setUsersInStore = selectFromStore(
        'users/set'
    ) as UsersSlice['users/set'];
    const setUserPaginationInStore = selectFromStore(
        'userPagination/set'
    ) as UsersSlice['userPagination/set'];
    const loggedUser = selectFromStore('loggedUser') as AuthSlice['loggedUser'];
    const userId =
        userInStore?.id !== viewedUserId ? viewedUserId : userInStore?.id;

    const {
        data: responseUser,
        error: responseUserError,
        isError: isResponseUserFailed,
        isRefetching: isUserRefetching,
        isPending: isResponseUserPending,
        isSuccess: isResponseUserSuccess,
        dataUpdatedAt: responseUserUpdatedAt,
        refetch
    } = useQuery({
        queryFn: () => showUser(userId as string),
        queryKey: ['user', userId],
        refetchInterval: false,
        enabled: !!userId
    });

    const {
        data: deleteUserData,
        isError: isDeleteUserFailed,
        isPending: isDeleteUserPending,
        isSuccess: isDeleteUserSuccess,
        mutateAsync: deleteUser
    } = useMutation({
        async mutationFn(
            id: UserDeleteRequest
        ): Promise<UserDeleteResponse | unknown> {
            return deleteUserApi(id);
        }
    });

    const user = (userInStore ? userInStore : responseUser) as User;

    const handleDeleteUser = async () => {
        try {
            await deleteUser(userToDelete?.id || '');

            setViewedUser(null);
            setUserToDelete(null);
        } catch (error) {
            console.log(error);

            setUsersInStore([]);
            setUserInStore(undefined);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({
                queryKey: ['user', userToDelete?.id]
            });

            sharedErrorsHandlers.handleOtherErrors(
                error,
                setDeleteUserOtherErrorMessage
            );
            sharedErrorsHandlers.handleUnknownError(
                error,
                setDeleteUserOtherErrorMessage
            );
        }
    };

    const handleRefetchUser = async () => {
        try {
            setIsRefetchDisabled(true);

            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setUserInStore(data?.data as User);
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    useEffect(() => {
        if (isResponseUserFailed && responseUserError) {
            console.error(responseUserError);

            handleServerShowErrors(
                responseUserError,
                setShowUserOtherErrorMessage
            );

            setUserInStore(undefined);
        }
    }, [isResponseUserFailed]);

    useEffect(() => {
        if (isResponseUserSuccess && responseUser) {
            setUserInStore(responseUser);
        }
    }, [isResponseUserSuccess]);

    useEffect(() => {
        if (isRefetchDisabled) {
            const timeout = setTimeout(
                () => setIsRefetchDisabled(false),
                10 * 1000
            );

            return () => clearTimeout(timeout);
        }
    }, [isRefetchDisabled]);

    useEffect(() => {
        if (isDeleteUserSuccess) {
            console.log(deleteUserData, isDeleteUserSuccess);

            setUserInStore(undefined);
            setUsersInStore([]);
            setUserPaginationInStore(undefined);
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });

            toast.success(messages.successfullyDeleted);
        }
    }, [isDeleteUserSuccess]);

    return {
        user,
        loggedUser,
        userToDelete,
        isUserRefetching,
        isRefetchDisabled,
        isDeleteUserFailed,
        isDeleteUserPending,
        isDeleteUserSuccess,
        isResponseUserFailed,
        isResponseUserSuccess,
        responseUserUpdatedAt,
        isResponseUserPending,
        showUserOtherErrorMessage,
        deleteUserOtherErrorMessage,
        setUserToDelete,
        handleDeleteUser,
        handleRefetchUser,
        setShowUserOtherErrorMessage,
        setDeleteUserOtherErrorMessage
    };
};

import toast from 'react-hot-toast';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { trpc } from '@/plugins/trpc';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import * as sharedErrorsHandlers from '@/helpers/sharedErrorsHandlers';

import type { User, AuthSlice, UsersSlice } from '@/types';

export const useUserDrawer = ({
    viewedUserId,
    setViewedUser,
    setIsCreateOrUpdateModalOpen
}: {
    viewedUserId: string | undefined;
    setViewedUser: Dispatch<SetStateAction<User | undefined>>;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const trpcUtils = trpc.useUtils();
    const [userToDelete, setUserToDelete] = useState<User | undefined>();
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
        isLoading: isResponseUserPending,
        isSuccess: isResponseUserSuccess,
        dataUpdatedAt: responseUserUpdatedAt,
        refetch
    } = trpc.users.show.useQuery(
        { id: userId || '' },
        {
            refetchInterval: false,
            enabled: !!userId
        }
    );

    const {
        isError: isDeleteUserFailed,
        isLoading: isDeleteUserPending,
        isSuccess: isDeleteUserSuccess,
        mutateAsync: deleteUser
    } = trpc.users.delete.useMutation();

    const user = (userInStore ? userInStore : responseUser) as User;

    const handleDeleteUser = async () => {
        try {
            await deleteUser({ id: userToDelete?.id || '' });
            setViewedUser(undefined);
            setUserToDelete(undefined);
        } catch (error) {
            setUsersInStore([]);
            setUserInStore(undefined);
            trpcUtils.users.fetch.invalidate();
            sharedErrorsHandlers.handleOtherErrors(
                error,
                setDeleteUserOtherErrorMessage
            );
            sharedErrorsHandlers.handleUnknownError(
                error,
                setDeleteUserOtherErrorMessage
            );

            return error;
        }
    };

    const handleRefetchUser = async () => {
        try {
            setIsRefetchDisabled(true);

            const data = await refetch();

            if (data.error) {
                throw data.error;
            }

            setUserInStore(data?.data as User | undefined);
        } catch (error) {
            console.error(error);

            toast.error(messages.failedToRefetchedData);
        }
    };

    const handleOpenUpdateModal = () => {
        setShowUserOtherErrorMessage('');
        setViewedUser(user);
        setIsCreateOrUpdateModalOpen(true);
    };

    const handleCloseDrawer = () => {
        setViewedUser(undefined);
        setShowUserOtherErrorMessage('');
        setDeleteUserOtherErrorMessage('');
    };

    const handleCloseDeleteDialog = () => {
        setUserToDelete(undefined);
        setDeleteUserOtherErrorMessage('');
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
            setUserInStore(responseUser as User);
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
            setUserInStore(undefined);
            setUsersInStore([]);
            setUserPaginationInStore(undefined);
            trpcUtils.users.fetch.invalidate();

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
        handleCloseDrawer,
        handleOpenUpdateModal,
        handleCloseDeleteDialog
    };
};

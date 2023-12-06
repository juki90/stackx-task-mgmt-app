import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useQuery, useMutation, NetworkStatus } from '@apollo/client';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { en as messages } from '@/locales';
import { loggedUserAtom } from '@/atoms/auth';
import { DATE_FORMAT } from '@/config/constants';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import { USERS_FETCH, USER_DELETE, USER_SHOW } from '@/graphql/users';
import * as sharedErrorsHandlers from '@/helpers/sharedErrorsHandlers';
import { userAtom, userPaginationAtom, usersAtom } from '@/atoms/users';

import type { User } from '@/types';

export const useUserDrawer = ({
    viewedUserId,
    setViewedUser,
    setIsCreateOrUpdateModalOpen
}: {
    viewedUserId: string | null | undefined;
    setViewedUser: Dispatch<SetStateAction<User | null | undefined>>;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [fetchedAt, setFetchedAt] = useState('');
    const [showUserOtherErrorMessage, setShowUserOtherErrorMessage] =
        useState('');
    const [deleteUserOtherErrorMessage, setDeleteUserOtherErrorMessage] =
        useState('');
    const [userInStore, setUserInStore] = useAtom(userAtom);
    const setUsersInStore = useSetAtom(usersAtom);
    const setUserPaginationInStore = useSetAtom(userPaginationAtom);
    const loggedUser = useAtomValue(loggedUserAtom);
    const userId =
        userInStore?.id !== viewedUserId ? viewedUserId : userInStore?.id;

    const {
        data: showUserResponseData,
        error: showUserResponseError,
        networkStatus: showStatus,
        refetch
    } = useQuery(USER_SHOW, {
        skip: !userId,
        variables: {
            id: userId
        }
    });

    const [deleteUser, { data: deleteUserData, error: deleteUserError }] =
        useMutation(USER_DELETE, {
            refetchQueries: [USERS_FETCH]
        });

    const user = (
        userInStore ? userInStore : showUserResponseData?.user
    ) as User;

    const handleDeleteUser = async () => {
        try {
            await deleteUser({ variables: { id: userToDelete?.id || '' } });

            setViewedUser(null);
            setUserToDelete(null);
        } catch (error) {
            setUsersInStore([]);
            setUserInStore(null);

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
            setIsRefetching(true);

            const data = await refetch();

            setIsRefetching(false);

            if (data.error) {
                throw data.error;
            }

            setFetchedAt(dayjs().format(DATE_FORMAT));
            setUserInStore(data?.data as User);
        } catch (error) {
            console.error(error);
            setIsRefetching(false);
            toast.error(messages.failedToRefetchedData);
        }
    };

    const handleOpenUpdateModal = () => {
        setShowUserOtherErrorMessage('');
        setViewedUser(user);
        setIsCreateOrUpdateModalOpen(true);
    };

    const handleCloseDrawer = () => {
        setFetchedAt('');
        setViewedUser(null);
        setShowUserOtherErrorMessage('');
        setDeleteUserOtherErrorMessage('');
    };

    const handleCloseDeleteDialog = () => {
        setUserToDelete(null);
        setDeleteUserOtherErrorMessage('');
    };

    useEffect(() => {
        if (showStatus === NetworkStatus.ready && showUserResponseData?.user) {
            setUserInStore(showUserResponseData.user);
        }

        if (showStatus === NetworkStatus.error && showUserResponseError) {
            console.error(showUserResponseError);

            handleServerShowErrors(
                showUserResponseError,
                setShowUserOtherErrorMessage
            );

            setUserInStore(null);
        }
    }, [showStatus]);

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
        if (deleteUserData && !deleteUserError) {
            setUserInStore(null);
            setUsersInStore([]);
            setUserPaginationInStore({ size: 10, index: 0, total: 0 });

            toast.success(messages.successfullyDeleted);
        }
    }, [deleteUserData]);

    return {
        user: showUserResponseData?.user,
        fetchedAt,
        loggedUser,
        showStatus,
        userToDelete,
        isRefetching,
        isRefetchDisabled,
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

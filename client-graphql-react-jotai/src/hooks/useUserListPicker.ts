import { useTheme } from '@mui/material';
import { NetworkStatus, useQuery } from '@apollo/client';
import { useState, useContext, useEffect } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';

import type { TaskUserStatusInfo } from '@/types';
import { USERS_FETCH } from '@/graphql/users';

export const useUserListPicker = () => {
    const theme = useTheme();
    const { userList: pickerUsersList, setUserList: setPickerUserList } =
        useContext(UserPickerUsersListContext);
    const [initialPickerUsers] =
        useState<TaskUserStatusInfo[]>(pickerUsersList);
    const [pickerErrorMessage, setPickerErrorMessage] = useState('');
    const [usersFilter, setUsersFilter] = useState('');

    const {
        data: responseUsers,
        error: responseError,
        networkStatus: fetchStatus,
        refetch
    } = useQuery(USERS_FETCH, {
        variables: {
            pageData: { size: 10, index: 0 },
            filterData: usersFilter
        }
    });

    const users =
        responseUsers?.users?.rows.map(
            ({
                fullName,
                email,
                id
            }: {
                fullName: string;
                email: string;
                id: string;
            }) => ({
                fullName,
                email,
                id,
                doneAt: ''
            })
        ) || [];

    useDebounce(usersFilter, () => refetch());

    useEffect(() => {
        if (fetchStatus === NetworkStatus.error) {
            console.error(responseError);

            handleServerShowErrors(responseError, setPickerErrorMessage);
        }
    }, [responseUsers]);

    return {
        theme,
        users,
        usersFilter,
        pickerUsersList,
        pickerErrorMessage,
        initialPickerUsers,
        setUsersFilter,
        setPickerUserList
    };
};

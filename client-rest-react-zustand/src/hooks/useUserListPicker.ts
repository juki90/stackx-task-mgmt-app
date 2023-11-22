import { useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, useContext, useEffect } from 'react';

import { fetchUsers } from '@/api/users';
import { useDebounce } from '@/hooks/useDebounce';
import handleServerShowErrors from '@/helpers/handleServerShowErrors';
import { UserPickerUsersListContext } from '@/context/UserPickerUsersList';

import type { TaskUserStatusInfo } from '@/types';

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
        error: responseUsersError,
        isError: isResponseUsersFailed,
        isRefetching: isUsersRefetching,
        isPending: isResponseUsersPending,
        isSuccess: isResponseUsersSuccess,
        refetch
    } = useQuery({
        queryFn: () =>
            fetchUsers({
                page: { size: 10, index: 0 },
                filter: usersFilter
            }),
        queryKey: ['users'],
        refetchInterval: false
    });

    const users =
        responseUsers?.rows.map(({ fullName, email, id }) => ({
            fullName,
            email,
            id,
            doneAt: ''
        })) || [];

    useDebounce(usersFilter, () => refetch());

    useEffect(() => {
        if (isResponseUsersFailed) {
            console.error(responseUsersError);

            handleServerShowErrors(responseUsersError, setPickerErrorMessage);
        }
    }, [responseUsers]);

    return {
        theme,
        users,
        usersFilter,
        pickerUsersList,
        isUsersRefetching,
        pickerErrorMessage,
        responseUsersError,
        initialPickerUsers,
        isResponseUsersFailed,
        isResponseUsersPending,
        isResponseUsersSuccess,
        setUsersFilter,
        setPickerUserList
    };
};

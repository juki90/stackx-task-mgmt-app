import { Autocomplete, TextField } from '@mui/material';

import { useUserListPicker } from '@/hooks/useUserListPicker';

import type { FC } from 'react';
import type { TaskUserStatusInfo, IUserListPicker, User } from '@/types';

export const UserListPicker: FC<IUserListPicker> = ({ fieldController }) => {
    const {
        users,
        theme,
        pickerUsersList,
        pickerErrorMessage,
        initialPickerUsers,
        setUsersFilter,
        setPickerUserList
    } = useUserListPicker();

    return (
        <Autocomplete
            multiple
            id="user-list-picker"
            sx={{
                marginBottom: '25px',
                '& .MuiInputBase-root, & .Mui-focused, & .MuiInputBase-root:hover':
                    {
                        borderRadius: '4px',
                        paddingBottom: '5px',
                        backgroundColor: `${theme.palette.getContrastText(
                            theme.palette.grey[800]
                        )} !important`
                    },
                '& .MuiFormHelperText-root, & .MuiFormHelperText-root:hover': {
                    backgroundColor: 'transparent !important'
                }
            }}
            includeInputInList
            options={users}
            defaultValue={initialPickerUsers}
            getOptionLabel={user => `${user?.fullName} (${user?.email})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(e, v) =>
                setPickerUserList ? setPickerUserList(v) : null
            }
            renderInput={params => (
                <TextField
                    {...params}
                    variant="filled"
                    label="Users"
                    sx={{
                        '& .MuiFormLabel-root': {
                            backgroundColor: 'transparent !important'
                        }
                    }}
                    error={
                        !!pickerErrorMessage ||
                        !!fieldController?.fieldState?.error?.message
                    }
                    helperText={
                        pickerErrorMessage ||
                        fieldController?.fieldState?.error?.message ||
                        `Picked ${pickerUsersList.length} of 50 users`
                    }
                    placeholder="Find user"
                    onChange={e => setUsersFilter(e.target.value)}
                />
            )}
        />
    );
};

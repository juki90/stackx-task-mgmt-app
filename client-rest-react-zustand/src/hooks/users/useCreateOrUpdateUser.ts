import deepEqual from 'deep-equal';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useController, Control } from 'react-hook-form';

import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { ROLES } from '@/config/constants';
import { createUser, updateUser } from '@/api/users';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import {
    createUserValidationSchema,
    updateUserNoPasswordValidationSchema,
    updateUserWithPasswordValidationSchema
} from '@/validations/users';

import type {
    User,
    UsersSlice,
    UserCreateRequest,
    UserUpdateRequest
} from '@/types';

export const useCreateOrUpdateUser = (
    userToUpdate: User | null | undefined,
    handleCloseModal: () => void
) => {
    const defaultBlankValues = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        isAdmin: false
    };
    const defaultUserValues = {
        id: userToUpdate?.id,
        firstName: userToUpdate?.firstName,
        lastName: userToUpdate?.lastName,
        email: userToUpdate?.email,
        password: '',
        isAdmin: userToUpdate?.role?.name === ROLES.ADMIN
    };
    const queryClient = useQueryClient();
    const loggedUser = selectFromStore('loggedUser');
    const setUsersInStore = selectFromStore(
        'users/set'
    ) as UsersSlice['users/set'];
    const setUserInStore = selectFromStore(
        'user/set'
    ) as UsersSlice['user/set'];
    const setUserPaginationInStore = selectFromStore(
        'userPagination/set'
    ) as UsersSlice['userPagination/set'];
    const theme = useTheme();
    const [isPasswordCheckboxChecked, setIsPasswordCheckboxChecked] = useState(
        !userToUpdate
    );
    const [otherResponseError, setOtherResponseError] = useState<string>('');
    const {
        control,
        formState: {
            errors: formErrors,
            isValid: isFormValid,
            isDirty: isFormDirty
        },
        setError,
        setValue,
        getValues,
        clearErrors,
        handleSubmit,
        reset: resetForm
    } = useForm<
        (UserCreateRequest | UserUpdateRequest) & {
            general?: string;
            other?: string;
        }
    >({
        defaultValues: userToUpdate ? defaultUserValues : defaultBlankValues,
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver<UserCreateRequest | UserUpdateRequest>(
            userToUpdate
                ? isPasswordCheckboxChecked
                    ? updateUserNoPasswordValidationSchema
                    : updateUserWithPasswordValidationSchema
                : createUserValidationSchema
        )
    });

    const firstNameFieldController = useController({
        control: control as Control<UserCreateRequest | UserUpdateRequest>,
        name: 'firstName'
    });
    const lastNameFieldController = useController({
        control: control as Control<UserCreateRequest | UserUpdateRequest>,
        name: 'lastName'
    });
    const emailFieldController = useController({
        control: control as Control<UserCreateRequest | UserUpdateRequest>,
        name: 'email'
    });
    const passwordFieldController = useController({
        control: control as Control<UserCreateRequest | UserUpdateRequest>,
        name: 'password'
    });
    const isAdminFieldController = useController({
        control: control as Control<UserCreateRequest | UserUpdateRequest>,
        name: 'isAdmin'
    });

    const {
        data: createOrUpdateData,
        isError: createOrUpdateFailed,
        isPending: createOrUpdatePending,
        isSuccess: createOrUpdateSuccess,
        mutateAsync: saveUser,
        reset: resetCreateOrUpdateResponse
    } = useMutation({
        async mutationFn(
            userData: UserCreateRequest | UserUpdateRequest
        ): Promise<UserCreateRequest | UserUpdateRequest | unknown> {
            try {
                setOtherResponseError('');

                return await (userToUpdate
                    ? updateUser(userData as UserUpdateRequest)
                    : createUser(userData as UserCreateRequest));
            } catch (error) {
                handleServerFormErrors(error, setError, setOtherResponseError);

                return error;
            }
        }
    });

    const firstNameErrorMessage = formErrors?.firstName?.message;
    const lastNameErrorMessage = formErrors?.lastName?.message;
    const emailErrorMessage = formErrors?.email?.message;
    const passwordErrorMessage = formErrors?.password?.message;

    const handleSaveUser = handleSubmit(userData => saveUser(userData));

    const checkIfFormValuesChanged = () => {
        const currentFormValues = getValues();

        return !deepEqual(
            userToUpdate
                ? {
                      ...currentFormValues,
                      id: userToUpdate.id
                  }
                : currentFormValues,
            userToUpdate ? defaultUserValues : defaultBlankValues
        );
    };

    const saveButtonAttributes = {
        message: userToUpdate ? 'Update' : 'Create',
        backgroundColor: theme.palette.grey[400]
    };

    if (
        ((!userToUpdate && !createOrUpdateSuccess) ||
            (userToUpdate && checkIfFormValuesChanged())) &&
        isFormDirty &&
        isFormValid
    ) {
        saveButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (createOrUpdatePending) {
        saveButtonAttributes.message = userToUpdate ? 'Updating' : 'Creating';
        saveButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (createOrUpdateSuccess && isFormValid && !otherResponseError) {
        saveButtonAttributes.message = 'Success';
        saveButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    const handleUpdateErrorCleanup = () => {
        setUsersInStore([]);
        setUserInStore(undefined);
        setUserPaginationInStore(undefined);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({
            queryKey: ['user', userToUpdate?.id]
        });
        resetCreateOrUpdateResponse();
    };

    useEffect(() => {
        if (userToUpdate) {
            setValue('password', '');
            clearErrors('password');
        }
    }, [isPasswordCheckboxChecked]);

    useEffect(() => {
        if (createOrUpdateData && otherResponseError) {
            const timeout = setTimeout(
                () => resetCreateOrUpdateResponse(),
                2000
            );

            return () => clearTimeout(timeout);
        }
    }, [createOrUpdateData]);

    useEffect(() => {
        resetCreateOrUpdateResponse();
        resetForm(userToUpdate ? defaultUserValues : defaultBlankValues);
        setOtherResponseError('');
    }, [userToUpdate]);

    useEffect(() => {
        if (createOrUpdateData && (otherResponseError || !isFormValid)) {
            handleUpdateErrorCleanup();

            return;
        }

        if (
            createOrUpdateData &&
            createOrUpdateSuccess &&
            isFormValid &&
            !otherResponseError
        ) {
            handleUpdateErrorCleanup();
            toast.success(messages.successfullySaved);
            handleCloseModal();
        }
    }, [createOrUpdateData]);

    return {
        theme,
        loggedUser,
        isFormDirty,
        isFormValid,
        emailErrorMessage,
        otherResponseError,
        createOrUpdateFailed,
        passwordErrorMessage,
        emailFieldController,
        lastNameErrorMessage,
        saveButtonAttributes,
        firstNameErrorMessage,
        createOrUpdateSuccess,
        createOrUpdatePending,
        isAdminFieldController,
        lastNameFieldController,
        passwordFieldController,
        firstNameFieldController,
        isPasswordCheckboxChecked,
        resetForm,
        handleSaveUser,
        setOtherResponseError,
        checkIfFormValuesChanged,
        setIsPasswordCheckboxChecked
    };
};

import deepEqual from 'deep-equal';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController, Control } from 'react-hook-form';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { trpc } from '@/plugins/trpc';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { ROLES } from '@/config/constants';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import {
    createUserValidationSchema,
    updateUserNoPasswordValidationSchema,
    updateUserWithPasswordValidationSchema
} from '@/validations/users';

import type {
    User,
    UsersSlice,
    UsersCreateRequest,
    UsersUpdateRequest
} from '@/types';

export const useCreateOrUpdateUser = ({
    user: userToUpdate,
    setIsCreateOrUpdateModalOpen
}: {
    user: User | null | undefined;
    isModalOpen: boolean;
    setIsCreateOrUpdateModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
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
    const trpcUtils = trpc.useUtils();
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
        (UsersCreateRequest | UsersUpdateRequest) & {
            general?: string;
            other?: string;
        }
    >({
        defaultValues: userToUpdate ? defaultUserValues : defaultBlankValues,
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver<UsersCreateRequest | UsersUpdateRequest>(
            userToUpdate
                ? isPasswordCheckboxChecked
                    ? updateUserNoPasswordValidationSchema
                    : updateUserWithPasswordValidationSchema
                : createUserValidationSchema
        )
    });

    console.log(userToUpdate?.role?.name === ROLES.ADMIN, userToUpdate);

    const firstNameFieldController = useController({
        control: control as Control<UsersCreateRequest | UsersUpdateRequest>,
        name: 'firstName'
    });
    const lastNameFieldController = useController({
        control: control as Control<UsersCreateRequest | UsersUpdateRequest>,
        name: 'lastName'
    });
    const emailFieldController = useController({
        control: control as Control<UsersCreateRequest | UsersUpdateRequest>,
        name: 'email'
    });
    const passwordFieldController = useController({
        control: control as Control<UsersCreateRequest | UsersUpdateRequest>,
        name: 'password'
    });
    const isAdminFieldController = useController({
        control: control as Control<UsersCreateRequest | UsersUpdateRequest>,
        name: 'isAdmin'
    });

    const {
        data: createOrUpdateData,
        isLoading: isCreateOrUpdatePending,
        isSuccess: isCreateOrUpdateSuccess,
        mutateAsync: saveUser,
        reset: resetCreateOrUpdateResponse
    } = userToUpdate
        ? trpc.users.update.useMutation()
        : trpc.users.create.useMutation();

    const firstNameErrorMessage = formErrors?.firstName?.message;
    const lastNameErrorMessage = formErrors?.lastName?.message;
    const emailErrorMessage = formErrors?.email?.message;
    const passwordErrorMessage = formErrors?.password?.message;

    const handleSaveUser = handleSubmit(async userData => {
        try {
            setOtherResponseError('');

            return await saveUser(
                (userToUpdate
                    ? {
                          id: userToUpdate.id,
                          ...userData
                      }
                    : userData) as
                    | {
                          id: string;
                          firstName: string;
                          lastName: string;
                          email: string;
                          isAdmin: boolean;
                          password?: string;
                      } & {
                          firstName: string;
                          lastName: string;
                          email: string;
                          password: string;
                          isAdmin: boolean;
                      }
            );
        } catch (error) {
            handleServerFormErrors(error, setError, setOtherResponseError);

            return error;
        }
    });

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
        ((!userToUpdate && !isCreateOrUpdateSuccess) ||
            (userToUpdate && checkIfFormValuesChanged())) &&
        isFormDirty &&
        isFormValid
    ) {
        saveButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (isCreateOrUpdatePending) {
        saveButtonAttributes.message = userToUpdate ? 'Updating' : 'Creating';
        saveButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (isCreateOrUpdateSuccess && isFormValid && !otherResponseError) {
        saveButtonAttributes.message = 'Success';
        saveButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    const handleUpdateErrorCleanup = () => {
        setUsersInStore([]);
        setUserInStore(undefined);
        setUserPaginationInStore(undefined);
        trpcUtils.users.fetch.invalidate();
        trpcUtils.users.show.invalidate({ id: userToUpdate?.id });
        resetCreateOrUpdateResponse();
    };

    const handleCloseModal = () => {
        resetForm(userToUpdate ? defaultUserValues : defaultBlankValues);
        setOtherResponseError('');
        setIsCreateOrUpdateModalOpen(false);
    };

    useEffect(() => {
        if (userToUpdate && isPasswordCheckboxChecked) {
            clearErrors('password');
            setValue('password', '');
        }

        resetForm(getValues(), { keepDirty: true });
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

        if (userToUpdate) {
            setIsPasswordCheckboxChecked(true);
        }
    }, [userToUpdate]);

    useEffect(() => {
        if (createOrUpdateData && (otherResponseError || !isFormValid)) {
            handleUpdateErrorCleanup();

            return;
        }

        if (
            createOrUpdateData &&
            isCreateOrUpdateSuccess &&
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
        passwordErrorMessage,
        emailFieldController,
        lastNameErrorMessage,
        saveButtonAttributes,
        firstNameErrorMessage,
        isAdminFieldController,
        isCreateOrUpdateSuccess,
        isCreateOrUpdatePending,
        lastNameFieldController,
        passwordFieldController,
        firstNameFieldController,
        isPasswordCheckboxChecked,
        resetForm,
        handleSaveUser,
        handleCloseModal,
        setOtherResponseError,
        checkIfFormValuesChanged,
        setIsPasswordCheckboxChecked
    };
};

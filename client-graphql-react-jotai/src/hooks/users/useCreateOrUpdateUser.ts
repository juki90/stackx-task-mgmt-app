import deepEqual from 'deep-equal';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { useMutation } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController, Control } from 'react-hook-form';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { en as messages } from '@/locales';
import { ROLES } from '@/config/constants';
import { loggedUserAtom } from '@/atoms/auth';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import { userAtom, userPaginationAtom, usersAtom } from '@/atoms/users';
import {
    USERS_FETCH,
    USER_CREATE,
    USER_SHOW,
    USER_UPDATE
} from '@/graphql/users';
import {
    createUserValidationSchema,
    updateUserNoPasswordValidationSchema,
    updateUserWithPasswordValidationSchema
} from '@/validations/users';

import type { User, UserCreateRequest, UserUpdateRequest } from '@/types';

export const useCreateOrUpdateUser = ({
    user: userToUpdate,
    setIsCreateOrUpdateModalOpen
}: {
    user: User | null | undefined;
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
    const loggedUser = useAtomValue(loggedUserAtom);
    const setUsersInStore = useSetAtom(usersAtom);
    const setUserInStore = useSetAtom(userAtom);
    const setUserPaginationInStore = useSetAtom(userPaginationAtom);
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

    const refetchQueries = [USER_SHOW, USERS_FETCH];

    const [
        createUser,
        {
            data: createUserData,
            loading: createUserLoading,
            reset: resetCreateUserResponse
        }
    ] = useMutation(USER_CREATE, { refetchQueries });
    const [
        updateUser,
        {
            data: updateUserData,
            loading: updateUserLoading,
            reset: resetUpdateUserResponse
        }
    ] = useMutation(USER_UPDATE, { refetchQueries });

    const firstNameErrorMessage = formErrors?.firstName?.message;
    const lastNameErrorMessage = formErrors?.lastName?.message;
    const emailErrorMessage = formErrors?.email?.message;
    const passwordErrorMessage = formErrors?.password?.message;
    const isCreateOrUpdateUserSuccess =
        createUserData?.createUser || updateUserData?.updateUser;
    const isCreateOrUpdatePending = createUserLoading || updateUserLoading;

    const handleSaveUser = handleSubmit(
        async (
            userData: UserCreateRequest | UserUpdateRequest
        ): Promise<UserCreateRequest | UserUpdateRequest | unknown> => {
            try {
                setOtherResponseError('');

                let id, finalUserPayload;

                if (userToUpdate) {
                    const { id: userId, ...userPayload } =
                        userData as UserUpdateRequest;

                    finalUserPayload = userPayload;
                    id = userId;
                    delete userPayload.password;
                }

                if (!userToUpdate) {
                    finalUserPayload = userData;
                }

                const data = await (userToUpdate
                    ? updateUser({
                          variables: {
                              id,
                              updateUserInput:
                                  finalUserPayload as UserUpdateRequest
                          }
                      })
                    : createUser({
                          variables: {
                              createUserInput:
                                  finalUserPayload as UserCreateRequest
                          }
                      }));

                return data;
            } catch (error) {
                handleServerFormErrors(error, setError, setOtherResponseError);

                return error;
            }
        }
    );

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
        ((!userToUpdate && !isCreateOrUpdateUserSuccess) ||
            (userToUpdate && checkIfFormValuesChanged())) &&
        isFormDirty &&
        isFormValid
    ) {
        saveButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (createUserLoading || updateUserLoading) {
        saveButtonAttributes.message = userToUpdate ? 'Updating' : 'Creating';
        saveButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (isCreateOrUpdateUserSuccess && isFormValid && !otherResponseError) {
        saveButtonAttributes.message = 'Success';
        saveButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    const handleUpdateErrorCleanup = () => {
        setUsersInStore([]);
        setUserInStore(null);
        setUserPaginationInStore({ size: 10, index: 0, total: 0 });
        userToUpdate ? resetUpdateUserResponse() : resetCreateUserResponse();
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
        if (isCreateOrUpdateUserSuccess && otherResponseError) {
            const timeout = setTimeout(
                () =>
                    userToUpdate
                        ? resetUpdateUserResponse()
                        : resetCreateUserResponse(),
                2000
            );

            return () => clearTimeout(timeout);
        }
    }, [isCreateOrUpdateUserSuccess]);

    useEffect(() => {
        userToUpdate ? resetUpdateUserResponse() : resetCreateUserResponse();
        resetForm(userToUpdate ? defaultUserValues : defaultBlankValues);
        setOtherResponseError('');

        if (userToUpdate) {
            setIsPasswordCheckboxChecked(true);
        }
    }, [userToUpdate]);

    useEffect(() => {
        if (
            isCreateOrUpdateUserSuccess &&
            (otherResponseError || !isFormValid)
        ) {
            handleUpdateErrorCleanup();

            return;
        }

        if (isCreateOrUpdateUserSuccess && isFormValid && !otherResponseError) {
            handleUpdateErrorCleanup();
            toast.success(messages.successfullySaved);
            handleCloseModal();
        }
    }, [isCreateOrUpdateUserSuccess]);

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
        isCreateOrUpdatePending,
        lastNameFieldController,
        passwordFieldController,
        firstNameFieldController,
        isPasswordCheckboxChecked,
        isCreateOrUpdateUserSuccess,
        resetForm,
        handleSaveUser,
        handleCloseModal,
        setOtherResponseError,
        checkIfFormValuesChanged,
        setIsPasswordCheckboxChecked
    };
};

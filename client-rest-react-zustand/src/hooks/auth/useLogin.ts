import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController } from 'react-hook-form';

import { routes } from '@/router';
import { authLogin } from '@/api/auth';
import { selectFromStore } from '@/store';
import { en as messages } from '@/locales';
import { loginValidationSchema } from '@/validations/auth/login';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';

import type { AuthSlice, AuthLoginRequest, AuthLoginResponse } from '@/types';

export const useLogin = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [otherResponseError, setOtherResponseError] = useState<string>('');
    const {
        control,
        formState: { errors: formErrors, isValid: isFormValid },
        watch,
        setError,
        clearErrors,
        handleSubmit
    } = useForm<AuthLoginRequest & { general?: string }>({
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver(loginValidationSchema)
    });
    const emailFieldController = useController({
        control,
        name: 'email'
    });
    const passwordFieldController = useController({
        control,
        name: 'password'
    });

    const {
        data: loginResponseData,
        isError: loginResponseFailed,
        isPending: loginResponsePending,
        isSuccess: loginResponseSuccess,
        mutateAsync: mutateLogin,
        reset: resetLoginResponse
    } = useMutation({
        async mutationFn(
            loginData: AuthLoginRequest
        ): Promise<AuthLoginResponse | unknown> {
            try {
                setOtherResponseError('');

                return await authLogin(loginData);
            } catch (error) {
                handleServerFormErrors(error, setError, setOtherResponseError);

                return error;
            }
        }
    });

    const fieldWatcher = watch();
    const emailErrorMessage = formErrors?.email?.message;
    const passwordErrorMessage = formErrors?.password?.message;
    const generalErrorMessage = formErrors?.general?.message;

    const handleLogin = handleSubmit((loginData: AuthLoginRequest) =>
        mutateLogin(loginData)
    );

    const loginButtonAttributes = {
        message: 'Log in',
        backgroundColor: theme.palette.grey[400]
    };

    if (!loginResponseSuccess && isFormValid) {
        loginButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (loginResponsePending) {
        loginButtonAttributes.message = 'Authenticating';
        loginButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (
        loginResponseSuccess &&
        isFormValid &&
        !generalErrorMessage &&
        !otherResponseError
    ) {
        loginButtonAttributes.message = 'Logged In';
        loginButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    const setLoggedUser = selectFromStore(
        'loggedUser/set'
    ) as AuthSlice['loggedUser/set'];

    useEffect(() => {
        if (formErrors.general) {
            clearErrors('general');
            resetLoginResponse();
        }
    }, [fieldWatcher.email, fieldWatcher.password]);

    useEffect(() => {
        if (loginResponseData && otherResponseError) {
            const timeout = setTimeout(() => resetLoginResponse(), 2000);

            return () => clearTimeout(timeout);
        }

        if (loginResponseData && loginResponseSuccess && !generalErrorMessage) {
            setLoggedUser();
            toast.success(messages.successfullyLoggedIn);
            const timeout = setTimeout(() => navigate(routes.dashboard), 500);

            return () => clearTimeout(timeout);
        }
    }, [loginResponseData]);

    return {
        theme,
        isFormValid,
        emailErrorMessage,
        otherResponseError,
        generalErrorMessage,
        loginResponseFailed,
        passwordErrorMessage,
        loginResponseSuccess,
        loginResponsePending,
        emailFieldController,
        loginButtonAttributes,
        passwordFieldController,
        handleLogin
    };
};

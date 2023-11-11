import { useEffect } from 'react';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController } from 'react-hook-form';

import { routes } from '@/router';
import { authLogin } from '@/api/auth';
import { en as messages } from '@/locales';
import handleFormErrors from '@/helpers/handleFormErrors';
import { loginValidationSchema } from '@/validations/auth/login';

import type { AuthLoginRequest, AuthLoginResponse } from '@/types';
import toast from 'react-hot-toast';

export const useLogin = () => {
    const defaultValues = {
        email: '',
        password: ''
    };
    const theme = useTheme();
    const navigate = useNavigate();
    const {
        control,
        formState: { errors: formErrors, isValid: isFormValid },
        watch,
        setError,
        setValue,
        getValues,
        clearErrors,
        handleSubmit
    } = useForm<AuthLoginRequest & { general?: string }>({
        defaultValues,
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
        error: loginResponseError,
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
                return await authLogin(loginData);
            } catch (error) {
                handleFormErrors(error, setError);

                toast.error(messages.fixFormErrors);

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

    if (loginResponseSuccess && isFormValid && !generalErrorMessage) {
        loginButtonAttributes.message = 'Logged In';
        loginButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    useEffect(() => {
        if (formErrors.general) {
            clearErrors('general');
            resetLoginResponse();
        }
    }, [fieldWatcher.email, fieldWatcher.password]);

    useEffect(() => {
        if (loginResponseData && loginResponseSuccess && !generalErrorMessage) {
            toast.success(messages.successfullyLoggedIn);
            setTimeout(() => navigate(routes.dashboard), 1000);
        }
    }, [loginResponseData]);

    return {
        theme,
        control,
        formErrors,
        isFormValid,
        emailErrorMessage,
        generalErrorMessage,
        passwordErrorMessage,
        loginResponseData,
        loginResponseError,
        loginResponseFailed,
        loginResponsePending,
        emailFieldController,
        loginResponseSuccess,
        loginButtonAttributes,
        passwordFieldController,
        watch,
        setValue,
        getValues,
        clearErrors,
        handleLogin,
        mutateLogin,
        resetLoginResponse
    };
};

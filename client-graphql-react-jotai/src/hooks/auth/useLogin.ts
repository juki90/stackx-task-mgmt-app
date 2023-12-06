import { useSetAtom } from 'jotai';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useController } from 'react-hook-form';

import { routes } from '@/router';
import { LOGIN } from '@/graphql/auth';
import { en as messages } from '@/locales';
import { loginValidationSchema } from '@/validations/auth/login';
import handleServerFormErrors from '@/helpers/handleServerFormErrors';
import { loggedUserAtom, readLoggedUserFromAccessToken } from '@/atoms/auth';

import type { AuthLoginRequest } from '@/types';

export const useLogin = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [otherResponseError, setOtherResponseError] = useState<string>('');
    const {
        control,
        formState: { errors: formErrors, isValid: isFormValid },
        watch,
        setError,
        handleSubmit
    } = useForm<AuthLoginRequest>({
        defaultValues: { email: '', password: '' },
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver(loginValidationSchema)
    });
    const setLoggedUser = useSetAtom(loggedUserAtom);

    const emailFieldController = useController({
        control,
        name: 'email'
    });
    const passwordFieldController = useController({
        control,
        name: 'password'
    });

    const [
        login,
        {
            data: loginResponseData,
            loading: loginResponsePending,
            error: loginResponseFailed,
            reset: resetLoginResponse
        }
    ] = useMutation(LOGIN);

    const handleLogin = handleSubmit(async loginInputData => {
        try {
            setOtherResponseError('');

            return await login({ variables: { loginInputData } });
        } catch (error) {
            handleServerFormErrors(error, setError, setOtherResponseError);

            return error;
        }
    });

    const fieldWatcher = watch();
    const emailErrorMessage = formErrors?.email?.message;
    const passwordErrorMessage = formErrors?.password?.message;

    const loginButtonAttributes = {
        message: 'Log in',
        backgroundColor: theme.palette.grey[400]
    };

    if (!loginResponseData && isFormValid) {
        loginButtonAttributes.backgroundColor = theme.palette.primary.light;
    }

    if (loginResponsePending) {
        loginButtonAttributes.message = 'Authenticating';
        loginButtonAttributes.backgroundColor = theme.palette.grey[400];
    }

    if (loginResponseData && isFormValid && !otherResponseError) {
        loginButtonAttributes.message = 'Logged In';
        loginButtonAttributes.backgroundColor = theme.palette.success.light;
    }

    useEffect(() => {
        if (otherResponseError) {
            setOtherResponseError('');
            resetLoginResponse();
        }
    }, [fieldWatcher.email, fieldWatcher.password]);

    useEffect(() => {
        if (loginResponseFailed && otherResponseError) {
            const timeout = setTimeout(() => resetLoginResponse(), 2000);

            return () => clearTimeout(timeout);
        }

        if (loginResponseData && !otherResponseError) {
            setLoggedUser(readLoggedUserFromAccessToken());
            toast.success(messages.successfullyLoggedIn);
            const timeout = setTimeout(() => navigate(routes.dashboard), 500);

            return () => clearTimeout(timeout);
        }
    }, [loginResponseData]);

    return {
        theme,
        isFormValid,
        loginResponseData,
        emailErrorMessage,
        otherResponseError,
        loginResponseFailed,
        passwordErrorMessage,
        loginResponsePending,
        emailFieldController,
        loginButtonAttributes,
        passwordFieldController,
        handleLogin
    };
};

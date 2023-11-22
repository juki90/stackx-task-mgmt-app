import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

import { en as messages } from '@/locales';
import {
    handleOtherErrors,
    handleUnknownError
} from '@/helpers/sharedErrorsHandlers';

import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetError } from 'react-hook-form';
import type {
    AuthLoginRequest,
    UserCreateRequest,
    UserUpdateRequest,
    TaskCreateRequest,
    TaskUpdateRequest,
    ResponseFormErrors
} from '@/types';

export default (
    error: unknown | Error | AxiosError,
    setFormError: UseFormSetError<
        AuthLoginRequest &
            UserCreateRequest &
            UserUpdateRequest & {
                general?: string;
                other?: string;
            } & TaskCreateRequest &
            TaskUpdateRequest
    >,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (error instanceof AxiosError) {
        const formErrors = (error as AxiosError<ResponseFormErrors>)?.response
            ?.data?.errors;

        if (Array.isArray(formErrors) && formErrors?.length) {
            (formErrors as ResponseFormErrors['errors']).forEach(error => {
                const field = error?.field as keyof (AuthLoginRequest & {
                    general?: string;
                });
                const message = error?.message;

                if (!field || field === 'general') {
                    setFormError('general', { message });

                    return;
                }

                if (field) {
                    setFormError(field, { message });
                }

                toast.error(messages.fixFormErrors);
            });

            return;
        }

        if (error?.response?.status === 404) {
            const notFoundMessage = (error as AxiosError)?.response
                ?.data as string;
            const finalMessage = notFoundMessage
                ? notFoundMessage === 'Not Found'
                    ? messages.modifiedResourceNotFound
                    : notFoundMessage
                : messages.modifiedResourceNotFound;

            setOtherError(finalMessage);

            return;
        }

        handleOtherErrors(error, setOtherError);

        return;
    }

    handleUnknownError(error, setOtherError);
};

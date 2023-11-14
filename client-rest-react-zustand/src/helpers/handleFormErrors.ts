import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { UseFormSetError } from 'react-hook-form';

import { en as messages } from '@/locales';

import type { Dispatch, SetStateAction } from 'react';
import type { AuthLoginRequest, ResponseFormErrors } from '@/types';

export default (
    error: unknown | Error | AxiosError,
    setFormError: UseFormSetError<
        AuthLoginRequest & { general?: string; other?: string }
    >,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (!(error instanceof AxiosError) && error instanceof Error) {
        setOtherError(messages.internalServerError);

        toast.error(messages.internalServerError);

        return;
    }

    if (error instanceof AxiosError) {
        const formErrors = (error as AxiosError<ResponseFormErrors>)?.response
            ?.data?.errors;

        if (Array.isArray(formErrors) && formErrors?.length) {
            (formErrors as ResponseFormErrors['errors']).forEach(error => {
                const field = error?.field as keyof (AuthLoginRequest & {
                    general?: string;
                });
                const message = error?.message;

                toast.error(messages.fixFormErrors);

                if (!field || field === 'general') {
                    setFormError('general', { message });

                    return;
                }

                if (field) {
                    setFormError(field, { message });
                }

                return;
            });
        }

        if (!navigator?.onLine) {
            setOtherError(messages.yourAreOffline);

            toast.error(messages.yourAreOffline);

            return;
        }

        const otherError = (error as AxiosError)?.response?.data;

        if (typeof otherError === 'string') {
            setFormError('general', { message: otherError });

            toast.error(otherError);

            return;
        }

        if (!otherError) {
            setOtherError(messages.ourServerIsDown);

            toast.error(messages.ourServerIsDown);

            return;
        }
    }
};

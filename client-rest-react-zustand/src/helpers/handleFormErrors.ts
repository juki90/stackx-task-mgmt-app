import { AxiosError } from 'axios';

import { en as messages } from '@/locales';

import type { UseFormSetError } from 'react-hook-form';
import type { AuthLoginRequest, ResponseFormErrors } from '@/types';

export default (
    error: unknown | Error | AxiosError,
    setError: UseFormSetError<AuthLoginRequest & { general?: string }>
) => {
    console.error(error);

    if (!(error instanceof AxiosError) && error instanceof Error) {
        setError('general', { message: messages.internalServerError });

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

                if (!field || field === 'general') {
                    setError('general', { message });

                    return;
                }

                if (field) {
                    setError(field, { message });
                }

                return;
            });
        }

        const otherError = (error as AxiosError)?.response?.data;

        if (typeof otherError === 'string') {
            setError('general', { message: otherError });
        }
    }
};

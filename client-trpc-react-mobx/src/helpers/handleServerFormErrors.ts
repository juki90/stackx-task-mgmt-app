import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

import { en as messages } from '@/locales';
import {
    handleOtherErrors,
    handleUnknownError
} from '@/helpers/sharedErrorsHandlers';

import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetError } from 'react-hook-form';
import type {
    AuthLoginRequest,
    UsersCreateRequest,
    UsersUpdateRequest,
    TasksCreateRequest,
    TasksUpdateRequest
} from '@/types';

type TFormKeyValues = AuthLoginRequest &
    UsersCreateRequest &
    UsersUpdateRequest & {
        general?: string;
        other?: string;
    } & TasksCreateRequest &
    TasksUpdateRequest;

export default (
    error: Error | unknown,
    setFormError: UseFormSetError<TFormKeyValues>,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (error instanceof TRPCClientError) {
        const firstErrorsPerField: {
            field: keyof TFormKeyValues;
            message: string;
        }[] = [];

        if (error?.shape?.message === 'NOT_FOUND') {
            setOtherError(messages.modifiedResourceNotFound);

            toast.error(messages.modifiedResourceNotFound);

            return;
        }

        try {
            const errorShapeMessages = JSON.parse(
                error?.shape?.message || 'null'
            );

            if (
                Array.isArray(errorShapeMessages) &&
                errorShapeMessages.length
            ) {
                errorShapeMessages.forEach(singleError => {
                    const field = singleError?.path?.length
                        ? singleError?.path[0]
                        : null;
                    const message = singleError?.message;

                    const isThisFieldWithErrorAlready =
                        firstErrorsPerField.some(
                            firstErrorWithField =>
                                field === firstErrorWithField.field
                        );

                    if (isThisFieldWithErrorAlready) {
                        return;
                    }

                    if (!field || field === 'general') {
                        firstErrorsPerField.push({
                            field: 'general',
                            message: message || messages.internalServerError
                        });

                        return;
                    }

                    firstErrorsPerField.push({ field, message });
                });

                if (firstErrorsPerField.length) {
                    firstErrorsPerField.forEach(({ field, message }) =>
                        setFormError(field, { message })
                    );
                }

                toast.error(messages.fixFormErrors);

                return;
            }
        } catch (err) {
            setFormError('general', {
                message: error?.shape?.message || messages.internalServerError
            });

            toast.error(messages.fixFormErrors);

            return;
        }

        handleOtherErrors(error, setOtherError);

        return;
    }

    handleUnknownError(error, setOtherError);
};

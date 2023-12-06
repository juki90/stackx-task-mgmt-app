import toast from 'react-hot-toast';
import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql/error';

import { en as messages } from '@/locales';
import {
    handleOtherErrors,
    handleUnknownError,
    handleUnauthenticatedError
} from '@/helpers/sharedErrorsHandlers';

import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetError } from 'react-hook-form';
import type {
    AuthLoginRequest,
    TRequest,
    TaskCreateRequest,
    TaskUpdateRequest,
    UserCreateRequest,
    UserUpdateRequest
} from '@/types';

type TUseFormSetError =
    | UseFormSetError<AuthLoginRequest & { general?: string }>
    | UseFormSetError<UserUpdateRequest & { general?: string }>
    | UseFormSetError<UserCreateRequest & { general?: string }>
    | UseFormSetError<TaskCreateRequest & { general?: string }>
    | UseFormSetError<TaskUpdateRequest & { general?: string }>;

export default (
    error: unknown | Error | ApolloError,
    setFormError?: TUseFormSetError,
    setOtherError?: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (error instanceof ApolloError) {
        if (handleUnauthenticatedError(error)) {
            return;
        }

        const errorContainingFormErrors = error?.graphQLErrors?.find(
            error => 'formErrors' in error
        ) as GraphQLError & {
            message?: string;
            code?: string;
            formErrors?: { field: string; message: string }[];
        };

        if (
            Array.isArray(errorContainingFormErrors?.formErrors) &&
            errorContainingFormErrors?.formErrors?.length
        ) {
            const { formErrors } = errorContainingFormErrors;

            formErrors.forEach(error => {
                const message = error?.message;
                const field = error?.field as keyof TRequest;

                if (setFormError && (!field || field === 'general')) {
                    setFormError('general', { message });

                    return;
                }

                if (field && setFormError) {
                    setFormError(field, { message });
                }

                toast.error(messages.fixFormErrors);
            });

            return;
        }

        const graphQlError = error?.graphQLErrors as (GraphQLError & {
            message?: string;
            code?: string;
        })[];

        if (
            setOtherError &&
            graphQlError.length &&
            graphQlError[0]?.message === 'Not Found' &&
            graphQlError[0]?.code === 'BAD_USER_INPUT'
        ) {
            setOtherError(messages.modifiedResourceNotFound);

            return;
        }

        handleOtherErrors(error, setOtherError);

        return;
    }

    handleUnknownError(error, setOtherError);
};

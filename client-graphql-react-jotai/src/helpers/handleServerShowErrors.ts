import toast from 'react-hot-toast';
import { ApolloError } from '@apollo/client';

import { en as messages } from '@/locales';
import {
    handleOtherErrors,
    handleUnknownError
} from '@/helpers/sharedErrorsHandlers';

import type { GraphQLError } from 'graphql';
import type { Dispatch, SetStateAction } from 'react';

export default (
    error: unknown | Error | ApolloError,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (error instanceof ApolloError) {
        const notFoundError = error?.graphQLErrors?.find(
            ({
                message,
                code
            }: GraphQLError & {
                message?: string;
                code?: string;
            }) => message === 'Not Found' && code === 'BAD_USER_INPUT'
        );

        if (notFoundError) {
            setOtherError(messages.notFoundShowing);

            toast.error(messages.notFoundShowing);

            return;
        }

        handleOtherErrors(error, setOtherError);

        return;
    }

    handleUnknownError(error, setOtherError);
};

import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { ApolloError } from '@apollo/client';

import { en as messages } from '@/locales';

import type { Dispatch, SetStateAction } from 'react';

export const handleOtherErrors = (
    error: ApolloError | unknown,
    setOtherError?: Dispatch<SetStateAction<string>>
) => {
    if (!navigator?.onLine) {
        if (setOtherError) {
            setOtherError(messages.yourAreOffline);
        }

        toast.error(messages.yourAreOffline);

        return;
    }

    const otherError = (error as ApolloError)?.message;

    if (typeof otherError === 'string' && otherError !== 'Failed to fetch') {
        if (setOtherError) {
            setOtherError(otherError);
        }

        toast.error(otherError);

        return;
    }

    if (!otherError || otherError === 'Failed to fetch') {
        if (setOtherError) {
            setOtherError(messages.ourServerIsDown);
        }

        toast.error(messages.ourServerIsDown);

        return;
    }
};

export const handleUnknownError = (
    error: unknown,
    setOtherError?: Dispatch<SetStateAction<string>>
) => {
    if (!(error instanceof ApolloError) && error instanceof Error) {
        if (setOtherError) {
            setOtherError(messages.internalServerError);
        }

        toast.error(messages.internalServerError);
    }
};

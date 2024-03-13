import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

import { en as messages } from '@/locales';

import type { Dispatch, SetStateAction } from 'react';
import type { AppRouter } from '@/plugins/trpc';

export const handleOtherErrors = (
    error: TRPCClientError<AppRouter> | unknown,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    if (!navigator?.onLine) {
        setOtherError(messages.yourAreOffline);

        toast.error(messages.yourAreOffline);

        return;
    }

    const otherError = (error as TRPCClientError<AppRouter>)?.shape?.data;

    if (typeof otherError === 'string') {
        setOtherError(otherError);

        toast.error(otherError);

        return;
    }

    if (!otherError) {
        setOtherError(messages.ourServerIsDown);

        toast.error(messages.ourServerIsDown);

        return;
    }
};

export const handleUnknownError = (
    error: unknown,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    if (!(error instanceof TRPCClientError) && error instanceof Error) {
        setOtherError(messages.internalServerError);

        toast.error(messages.internalServerError);

        return;
    }
};

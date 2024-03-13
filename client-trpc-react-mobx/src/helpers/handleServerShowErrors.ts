import toast from 'react-hot-toast';
import { TRPCClientError } from '@trpc/client';

import { en as messages } from '@/locales';
import {
    handleOtherErrors,
    handleUnknownError
} from '@/helpers/sharedErrorsHandlers';

import type { Dispatch, SetStateAction } from 'react';
import type { AppRouter } from '@/plugins/trpc';

export default (
    error: unknown | Error | TRPCClientError<AppRouter>,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (error instanceof TRPCClientError) {
        if (error?.shape?.message === 'NOT_FOUND') {
            setOtherError(messages.notFoundShowing);

            toast.error(messages.notFoundShowing);

            return;
        }

        handleOtherErrors(error, setOtherError);

        return;
    }

    handleUnknownError(error, setOtherError);
};

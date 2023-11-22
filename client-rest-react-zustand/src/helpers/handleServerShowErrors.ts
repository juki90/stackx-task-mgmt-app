import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

import { en as messages } from '@/locales';
import {
    handleOtherErrors,
    handleUnknownError
} from '@/helpers/sharedErrorsHandlers';

import type { Dispatch, SetStateAction } from 'react';

export default (
    error: unknown | Error | AxiosError,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    console.error(error);

    if (error instanceof AxiosError) {
        if (error?.response?.status === 404) {
            const notFoundMessage = (error as AxiosError)?.response
                ?.data as string;
            const finalMessage = notFoundMessage
                ? notFoundMessage !== 'Not Found'
                    ? messages.notFoundShowing
                    : notFoundMessage
                : messages.notFoundShowing;

            setOtherError(finalMessage);

            toast.error(messages.notFoundShowing);

            return;
        }

        handleOtherErrors(error, setOtherError);

        return;
    }

    handleUnknownError(error, setOtherError);
};

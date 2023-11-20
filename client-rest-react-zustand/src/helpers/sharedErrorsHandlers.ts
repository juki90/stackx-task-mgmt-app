import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

import { en as messages } from '@/locales';

import type { Dispatch, SetStateAction } from 'react';

export const handleOtherErrors = (
    error: AxiosError | unknown,
    setOtherError: Dispatch<SetStateAction<string>>
) => {
    if (!navigator?.onLine) {
        setOtherError(messages.yourAreOffline);

        toast.error(messages.yourAreOffline);

        return;
    }

    const otherError = (error as AxiosError)?.response?.data;

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
    if (!(error instanceof AxiosError) && error instanceof Error) {
        setOtherError(messages.internalServerError);

        toast.error(messages.internalServerError);

        return;
    }
};

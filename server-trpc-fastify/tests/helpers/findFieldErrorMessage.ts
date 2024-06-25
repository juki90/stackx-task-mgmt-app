export default (
    errorPayload: string,
    fieldName?: string
): string | undefined => {
    let finalParsedError:
        | { error: { json: { message: string } } }
        | string
        | undefined;

    try {
        if (!errorPayload) {
            return;
        }

        const preparsedErrorPayload = JSON.parse(errorPayload || '')?.error
            ?.json?.message as string;
        finalParsedError = preparsedErrorPayload;

        if (!fieldName) {
            return preparsedErrorPayload;
        }

        try {
            return JSON.parse(preparsedErrorPayload)?.find(
                (error: { code: string; path: string[]; message: string }) =>
                    fieldName.includes('.')
                        ? fieldName
                              .split('.')
                              .every(
                                  (fieldPathPoint, i) =>
                                      error?.path[i] === fieldPathPoint
                              )
                        : error?.path[0] === fieldName
            )?.message;
        } catch (err) {
            return;
        }
    } catch (err) {
        if (typeof finalParsedError !== 'object') {
            return finalParsedError;
        }

        return finalParsedError?.error?.json?.message;
    }
};

import { GraphQLFormattedError } from 'graphql';

export default (formattedError: GraphQLFormattedError) => {
    const formErrors = (
        formattedError?.extensions?.originalError as {
            message?: { field: string; message: string }[];
        }
    )?.message;

    if (formErrors) {
        return {
            message: null,
            formErrors
        };
    }

    if (formattedError?.extensions?.field) {
        return {
            message: null,
            formErrors: [
                {
                    field: formattedError?.extensions?.field,
                    message: formattedError?.message
                }
            ]
        };
    }

    const singleError: {
        field: unknown;
        message: string;
        code?: unknown;
    } = {
        field: formattedError?.extensions?.field,
        message: formattedError?.message
    };
    const code = formattedError?.extensions?.code;

    if (code) {
        singleError.code = code;
    }

    return singleError;
};

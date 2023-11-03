import { GraphQLFormattedError } from 'graphql';

export default (formattedError: GraphQLFormattedError) => {
    const formErrors = (
        formattedError?.extensions?.originalError as {
            message?: { field: string; message: string }[];
        }
    )?.message;

    if (formErrors) {
        return {
            formErrors
        } as unknown as GraphQLFormattedError;
    }

    if (formattedError?.extensions?.field) {
        return {
            formErrors: [
                {
                    field: formattedError?.extensions?.field,
                    message: formattedError?.message
                }
            ]
        } as unknown as GraphQLFormattedError;
    }

    const singleError = {
        field: formattedError?.extensions?.field,
        message: formattedError?.message
    };

    return singleError;
};

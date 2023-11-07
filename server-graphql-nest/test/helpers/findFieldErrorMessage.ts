import type { GraphQLError } from 'graphql';
import type { GraphQLFormError } from 'test/bootstrap';

export default (
    errors: readonly GraphQLFormError[] | readonly GraphQLError[],
    fieldName: string
): string | null => {
    const errorWithFormErrors = errors?.find(error => 'formErrors' in error);

    if (errorWithFormErrors) {
        return (errorWithFormErrors as GraphQLFormError)?.formErrors?.find(
            error => error?.field === fieldName
        )?.message;
    }

    return null;
};

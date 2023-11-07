import gql from 'graphql-tag';

import type { Variables, SuperTestGraphQL } from 'supertest-graphql';

type QueryOrMutateArgs = {
    gqlSchema: string;
    jwt?: string;
    variables?: Variables;
};

const queryOrMutate = <T>({
    isMutation,
    jwt,
    gqlSchema,
    variables = null
}: QueryOrMutateArgs & { isMutation: boolean }) => {
    let appRequest = request<T>(appServer);

    if (jwt) {
        appRequest = appRequest.set('Authorization', jwt);
    }

    appRequest = appRequest[isMutation ? 'mutate' : 'query'](gql`
        ${gqlSchema}
    `);

    if (variables) {
        appRequest = appRequest.variables(variables);
    }

    return appRequest;
};

const mutate = <T>(
    argsObject: QueryOrMutateArgs
): SuperTestGraphQL<T, Variables> =>
    queryOrMutate<T>({ ...argsObject, isMutation: true });

const query = <T>(
    argsObject: QueryOrMutateArgs
): SuperTestGraphQL<T, Variables> =>
    queryOrMutate<T>({ ...argsObject, isMutation: false });

export default {
    query,
    mutate
};

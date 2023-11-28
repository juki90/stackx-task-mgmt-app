import { GraphQLError } from 'graphql';
import {
    ApolloLink,
    ApolloClient,
    type Context,
    InMemoryCache,
    createHttpLink
} from '@apollo/client';

import { routes } from '@/router';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_SERVER_API_URL
});

const requestAuthLink = new ApolloLink((operation, forward) => {
    const jwtToken = localStorage.getItem('access_token');

    operation.setContext((context: Context) => {
        const headers = { ...context.headers };

        if (jwtToken) {
            headers.Authorization = `Bearer ${jwtToken}`;
        }

        return {
            ...context,
            headers
        };
    });

    return forward(operation);
});

const responseAuthRefreshedTokenReassigner = new ApolloLink(
    (operation, forward) => {
        return forward(operation).map(response => {
            const authHeader = operation
                .getContext()
                .response.headers.get('X-Auth-Token');

            const tokenMatch = /Bearer (\S+)/g.exec(authHeader);

            if (!tokenMatch || tokenMatch.length < 1) {
                return response;
            }

            const [, token] = tokenMatch;

            if (token) {
                localStorage.setItem('access_token', token);
            }

            return response;
        });
    }
);

const errorLink = onError(({ graphQLErrors }) => {
    if (
        (graphQLErrors as (GraphQLError & { code?: string })[])?.find(
            ({ code }) => code === 'UNAUTHENTICATED'
        )
    ) {
        // Jotai clear
        localStorage.clear();
        apolloClient.clearStore();
        window.location.href = routes.login;
    }
});

const apolloClient = new ApolloClient({
    link: ApolloLink.from([
        requestAuthLink,
        responseAuthRefreshedTokenReassigner,
        errorLink,
        httpLink
    ]),
    cache: new InMemoryCache()
});

export default apolloClient;

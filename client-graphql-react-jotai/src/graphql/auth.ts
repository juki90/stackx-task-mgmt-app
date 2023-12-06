import { gql } from '@apollo/client';

const LOGIN = gql`
    mutation Login($loginInputData: LoginInput!) {
        login(loginInput: $loginInputData) {
            id
            firstName
            lastName
            fullName
            email
            createdAt
            updatedAt
            createdBy {
                id
                email
            }
            role {
                id
                name
            }
        }
    }
`;

const ME = gql`
    query Me {
        me {
            id
            firstName
            lastName
            fullName
            email
            createdAt
            updatedAt
            createdBy {
                id
                fullName
                email
            }
            tasks {
                id
                title
                description
                status
                usersStatus {
                    userId
                    doneAt
                }
                createdBy {
                    id
                    fullName
                    email
                }
                updatedBy {
                    id
                    fullName
                    email
                }
                createdAt
                updatedAt
            }
        }
    }
`;

export { ME, LOGIN };

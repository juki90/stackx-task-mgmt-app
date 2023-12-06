import { gql } from '@apollo/client';

const USERS_FETCH = gql`
    query Users($pageData: PageArg!, $filterData: String) {
        users(page: $pageData, filter: $filterData) {
            rows {
                id
                firstName
                lastName
                fullName
                email
                createdAt
                updatedAt
            }
            count
        }
    }
`;

const USER_SHOW = gql`
    query User($id: ID!) {
        user(id: $id) {
            id
            firstName
            lastName
            fullName
            email
            createdBy {
                id
                fullName
                email
            }
            role {
                id
                name
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
                createdAt
                updatedAt
            }
            createdAt
            updatedAt
        }
    }
`;

const USER_DELETE = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id) {
            id
            firstName
            lastName
            fullName
            email
            createdAt
            updatedAt
        }
    }
`;

const USER_CREATE = gql`
    mutation CreateUser($createUserInput: CreateUserInput!) {
        createUser(createUserInput: $createUserInput) {
            id
            firstName
            lastName
            fullName
            email
            createdAt
            updatedAt
        }
    }
`;

const USER_UPDATE = gql`
    mutation UpdateUser($id: ID!, $updateUserInput: UpdateUserInput!) {
        updateUser(id: $id, updateUserInput: $updateUserInput) {
            id
            firstName
            lastName
            fullName
            email
            createdAt
            updatedAt
        }
    }
`;

export { USER_SHOW, USER_DELETE, USER_CREATE, USER_UPDATE, USERS_FETCH };

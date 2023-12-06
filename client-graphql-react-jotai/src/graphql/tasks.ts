import { gql } from '@apollo/client';

const TASKS_FETCH = gql`
    query Tasks($pageData: PageArg!, $filterData: String) {
        tasks(page: $pageData, filter: $filterData) {
            rows {
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
                    deletedAt
                }
                updatedBy {
                    id
                    fullName
                    email
                    deletedAt
                }
                createdAt
                updatedAt
            }
            count
        }
    }
`;

const TASK_SHOW = gql`
    query Task($id: ID!) {
        task(id: $id) {
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
                deletedAt
            }
            updatedBy {
                id
                fullName
                email
                deletedAt
            }
            users {
                id
                firstName
                lastName
                email
                fullName
                createdAt
                updatedAt
                deletedAt
            }
            createdAt
            updatedAt
        }
    }
`;

const TASK_CREATE = gql`
    mutation CreateTask($createTaskInput: CreateTaskInput!) {
        createTask(createTaskInput: $createTaskInput) {
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
`;

const TASK_UPDATE = gql`
    mutation UpdateTask($id: ID!, $updateTaskInput: UpdateTaskInput!) {
        updateTask(id: $id, updateTaskInput: $updateTaskInput) {
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
                deletedAt
            }
            updatedBy {
                id
                fullName
                email
                deletedAt
            }
            users {
                id
                firstName
                lastName
                email
                fullName
                createdAt
                updatedAt
                deletedAt
            }
            createdAt
            updatedAt
        }
    }
`;

const TASK_DELETE = gql`
    mutation DeleteTask($id: ID!) {
        deleteTask(id: $id) {
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
    }
`;

const TASK_CHANGE_STATUS = gql`
    mutation ChangeTaskStatus(
        $id: ID!
        $changeTaskStatusInput: ChangeTaskStatusInput!
    ) {
        changeTaskStatus(
            id: $id
            changeTaskStatusInput: $changeTaskStatusInput
        ) {
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
    }
`;

export {
    TASK_SHOW,
    TASKS_FETCH,
    TASK_CREATE,
    TASK_UPDATE,
    TASK_DELETE,
    TASK_CHANGE_STATUS
};

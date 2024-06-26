# StackX Task Management App

## Introduction

This is my project for learning purposes. I learn in it random JS related frameworks and approaches (REST API alternatives, state managements) only in Node.js and React.js.

Each main directory in this monorepository has the same task management app written in different framework of Node.js or different state management and style in React.js.

## What can I do in this app?

This app is written to manage tasks and users by administrators (users with 'admin' role). There is some additional logic and rules for users.

1. **Main administrator**:

- Is not created by somebody, but by the system. This admin can't be deleted by anyone, even by himself.
- Can only be edited, only by himself. His role can't be changed by anyone, even himself.
- Can create administrators

2. **Administrator**

- Is created by main admin. He can't modify other administrators nor main admin.
- Can create and modify regular users.
- Can manage everyone's tasks.

3. **User**

- Is standard person who can have given tasks by administrators.
- Can only browse and mark as done his tasks

4. **Task**

- Can be bound to many users/admins and user/admin can have many tasks. Every task has additionally title, description that is given during creation.
- Task has internal **status** (pending, cancelled or done). Users can change their own status of task as done. When task is done by a user, the date of finishing it appears on **usersStatus** list of task.
- Once a task is done by everyone it changes its status to done.
- It's impossible to change status of different user or undo status of task.
- When task is cancelled, it can't be reverted back to pending or done status. However cancelled task is editable (title and description, but not assigned users).
- When task gets 'done' status, it is then impossible to modify its assigned users.

## Table of technologies, libraries and other things used in the project

Generally, the app utilizes Typescript, Postgres, DI container (on the sever side only), some of the tests (not in every server or client) and JWT for authentication.

Apart from that, directory names in this repository have explicit structure: <br /><br />For Node servers: <br />**server**-**\<rest-api-or-alternative\>**-**\<nodejs-framework\>**.
<br /><br />For React clients: <br />**client**-**\<rest-api-or-alternative\>**-**\<react\>**-**\<react-state-mgmt\>**.

### Server technologies table

| Server              | API Design             | Framework  | Test types (basic coverage) | Databases | ORM/ODM   | Dependency inj. |
| ------------------- | ---------------------- | ---------- | --------------------------- | --------- | --------- | --------------- |
| server-rest-express | REST API               | Express.js | Functional (Jest)           | Postgres  | Sequelize | InverisfyJS     |
| server-graphql-nest | GraphQL (Schema first) | Nest.js    | Functional (Jest)           | Postgres  | TypeORM   | (built-in)      |
| server-trpc-fastify | tRPC                   | Fastify.js | Functional (Tap)            | Postgres  | Prisma    | InversifyJS     |

### Client technologies table

| Client                     | API Design | Framework (lib) | Component library | State Mgmt | API data loading | Forms           | Test types (basic coverage) |
| -------------------------- | ---------- | --------------- | ----------------- | ---------- | ---------------- | --------------- | --------------------------- |
| client-rest-react-zustand  | REST API   | React v18       | Material UI v5    | Zustand    | React Query      | react-hook-form | -                           |
| client-graphql-react-jotai | GraphQL    | React v18       | Material UI v5    | Jotai      | Apollo Client    | react-hook-form | -                           |
| client-trpc-react-mobx     | GraphQL    | React v18       | Material UI v5    | MobX       | React Query      | react-hook-form | -                           |

## Installation, deploying and running tests

For every **client-\*** and **server-\*** directory conjunction, the app is able to run only with the same REST API alternative (REST API, GraphQL or tRPC). For example directories starting with **server-rest-** and **client-rest-** only will work together.

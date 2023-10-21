# StackX Task Management App

## Introduction

This is my project for learning purposes. I learn in it random JS related frameworks and approaches (REST API alternatives, state managements) only in Node.js and React.js.

Each main directory in this monorepository has the same task management app written in different framework of Node.js or different state management and style in React.js.

## What can I do in this app?

This app is written to manage tasks and users by administrators (users with 'admin' role). There is some additional logic and rules for users.

- **Main administrator** is not created by somebody, but by the system. This admin can't be deleted by anyone, even by himself. Can only be edited, only by himself. His role can't be changed to regular user.
- **Administrator** is created by other admin. He can't delete admin by whom he was created nor update him.
- **User** is standard person who can have given tasks by administrators.
- **Task** can be bound to many users/admins and user/admin can have many tasks. Every task has additionally title, description that is given during creation. Task has internal **status** (pending, cancelled or done). Users can change their own status of task as done. When task is done by a user, the date of finishing it appears on **usersStatus** list of task. Once a task is done by everyone it changes its status to done. It's impossible to change status of different user or undo status of task. When task is cancelled, it can't be reverted back to pending or done status. However cancelled task is editable (it's assignees, title and description).

## Table of technologies, libraries and other things used in the project

Generally, the app utilizes Typescript, Postgres, DI container (on the sever side only), some of the tests (not in every server or client) and JWT authentication for login.

Apart from that, directory names in this repository have explicit structure: <br /><br />For Node servers: <br />**server**-**\<rest-api-or-alternative\>**-**\<nodejs-framework\>**.
<br /><br />For React clients: <br />**server**-**\<rest-api-or-alternative\>**-**\<nodejs-framework\>**.

### Server technologies table

| Server              | API Design | Framework  | Test types | Databases | Auth |
| ------------------- | ---------- | ---------- | ---------- | --------- | ---- |
| server-rest-express | REST API   | Express.js | Functional | Postgres  | JWT  |

## Installation, deploying and running tests

For every **client-\*** and **server-\*** directory conjunction, the app is able to run only with the same REST API alternative (REST API, GraphQL or tRPC). For example directories starting with **server-rest-** and **client-rest-** only then will work together.

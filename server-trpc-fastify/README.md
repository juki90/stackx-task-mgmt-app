# StackX Task Management App Server: tRPC API / Fastify.js edition

## Prerequisities

-   **npm** 9.50 or later
-   **Node** 18.14.2 or later
-   **Docker** 20.10.23 or later

## Local installation steps

### 1. Setting up environment variables

Copy **.env.example** file and rename it to **.env** file. Adjust some variables if needed, though default should work on clean environment:

```
NODE_ENV=dev
NODE_PORT=8080

COMPOSE_PROJECT_NAME=stackx-task-mgmt-server-trpc-fastify-dev

APP_URL=http://localhost:8080
APP_FRONTEND_URL=http://localhost:3000
APP_CORS_SITES=

POSTGRES_HOST=localhost
POSTGRES_DB=taskmgmt
POSTGRES_USER=postgres
POSTGRES_PASSWORD='9@C3$e%v*5n&ue#8d{?d!'
POSTGRES_PORT=8100
POSTGRES_URL=postgres://postgres:9%40C3%24e%25v*5n%26ue%238d%7B%3Fd!@localhost:8100/taskmgmt

PGADMIN_EMAIL=example@example.com
PGADMIN_PASSWORD=xyz123

JWT_SECRET=abc123
```

### 2. Setting up DB with Docker Compose

To set up Postgres and Postgres Admin dashboard, use following command in different terminal window:

`docker compose -f docker-compose.dev.yml  up`

(and `docker compose -f docker-compose.dev.yml down` to stop it)

### 3. Running server

Install dependencies:

`npm install`

Run these commands in following order for the first time:

`npm run db:clientinit:dev`

`npm run db:create:dev`

and then start server:

`npm run dev`

and now you can interact with this API

## Functional testing steps

### 1. Setting up environment variables

Copy **.env.test.example** file and rename it to **.env.test** file. Adjust some variables if needed, though default should work on clean environment:

```
NODE_ENV=test // must be 'test'
NODE_PORT=8081

COMPOSE_PROJECT_NAME=stackx-task-mgmt-server-trpc-fastify-test

APP_URL=http://localhost:8081

POSTGRES_HOST=localhost
POSTGRES_DB=taskmgmttest
POSTGRES_USER=postgrestest
POSTGRES_PASSWORD='9@C3$e%v*5n&ue#8d{?d!'
POSTGRES_PORT=8100
POSTGRES_URL=postgres://postgrestest:9%40C3%24e%25v%2A5n%26ue%238d%7B%3Fd%21@localhost:8101/taskmgmttest

JWT_SECRET=jwt123
```

### 2. Setting up DB with Docker Compose

To set up Postgres and Postgres Admin dashboard, use following command in different terminal window:

`docker compose -f docker-compose.test.yml --env-file .env.test  up`

(and `docker compose -f docker-compose.test.yml down` to stop it)

### 3. Running tests

Simply run this command:

`npm test`

and you will see test suites executing

## Deployment steps

Will be added much later...

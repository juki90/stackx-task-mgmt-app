# StackX Task Management App Server: REST API / Express.js edition

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

COMPOSE_PROJECT_NAME=stackx-task-mgmt-dev

APP_URL=http://localhost:8080
APP_FRONTEND_URL=http://localhost:3000
APP_CORS_SITES=

POSTGRES_HOST=localhost
POSTGRES_DB=taskmgmt
POSTGRES_USER=postgres
POSTGRES_PASSWORD='10@C4$e%v*5n&ue#2d{?d!'
POSTGRES_PORT=8100

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

Run this command only for the first time:

`npm run db:recreate:dev`

and then start server:

`npm run dev`

and now you can interact with this API

## Functional testing steps

### 1. Setting up environment variables

Copy **.env.test.example** file and rename it to **.env.test** file. Adjust some variables if needed, though default should work on clean environment:

```
NODE_ENV=test // must be 'test'
NODE_PORT=8081

COMPOSE_PROJECT_NAME=stackx-task-mgmt-test

APP_URL=http://localhost:8081

POSTGRES_HOST=localhost
POSTGRES_DB=taskmgmttest
POSTGRES_USER=postgrestest
POSTGRES_PASSWORD='9@C4$e%v*8n&ue#8e{?d!'
POSTGRES_PORT=8101

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

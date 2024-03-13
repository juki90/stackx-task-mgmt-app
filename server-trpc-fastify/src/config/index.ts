import path from 'path';
import * as dotenv from 'dotenv';

import readEnv from '~/config/utilities/readEnv';
import createPostgresUrl from '~/config/utilities/createPostgresUrl';

const nodeEnv = readEnv('NODE_ENV', 'dev');

dotenv.config({
    path:
        readEnv('NODE_ENV') === 'test'
            ? `${path.resolve(__dirname, '..', '..', '.env.test')}`
            : `${path.resolve(__dirname, '..', '..', '.env')}`
});

const envConfig = {
    app: {
        env: nodeEnv,
        port: +readEnv('NODE_PORT', '3000'),
        corsSites: readEnv('APP_CORS_SITES'),
        frontendUrl: readEnv('APP_FRONTEND_URL'),
        appUrl: readEnv('APP_URL', 'http://localhost:8080')
    },
    postgres: {
        url: createPostgresUrl(
            readEnv('POSTGRES_USER', 'postgres'),
            readEnv('POSTGRES_PASSWORD'),
            readEnv('POSTGRES_HOST', 'localhost'),
            +readEnv('POSTGRES_PORT', '8100'),
            readEnv('POSTGRES_DB', 'taskmgmt'),
            nodeEnv
        )
    },
    jwt: {
        expiresIn: 4 * 60 * 60,
        secret: readEnv('JWT_SECRET', 'xyx123')
    }
};

export { envConfig };

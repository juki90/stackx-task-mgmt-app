import readEnv from '@/config/utilities/readEnv';
import createPostgresUrl from '@/config/utilities/createPostgresUrl';

const nodeEnv = readEnv('NODE_ENV', 'dev');

export default () => ({
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
        ),
        type: 'postgres',
        host: readEnv('POSTGRES_HOST', 'localhost'),
        port: +readEnv('POSTGRES_PORT', '8100'),
        username: readEnv('POSTGRES_USER', 'postgres'),
        password: readEnv('POSTGRES_PASSWORD'),
        database: readEnv('POSTGRES_DB', 'taskmgmt'),
        synchronize: nodeEnv === 'test'
    },
    jwt: {
        expiresIn: 4 * 60 * 60,
        secret: readEnv('JWT_SECRET', 'xyx123')
    }
});

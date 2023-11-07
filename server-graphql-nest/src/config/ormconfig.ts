import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import readEnv from '@/config/utilities/readEnv';

dotenv.config();

const srcOrDist = `${process.env.NODE_ENV === 'dev' ? 'src' : 'dist'}`;

export const AppDataSouce = new DataSource({
    type: 'postgres',
    host: readEnv('POSTGRES_HOST', 'localhost'),
    port: +readEnv('POSTGRES_PORT', '8100'),
    username: readEnv('POSTGRES_USER', 'postgres'),
    password: readEnv('POSTGRES_PASSWORD'),
    database: readEnv('POSTGRES_DB', 'taskmgmt'),
    synchronize: false,
    migrations: [
        `${srcOrDist}/migrations/*.{ts,js}`,
        `${srcOrDist}/seeders/*.{ts,js}`
    ],
    entities: [`${srcOrDist}/entities/*.{ts,js}`]
});

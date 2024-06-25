import 'reflect-metadata';

import app from '~/index';
import { envConfig } from '~/config';

const start = async () => {
    try {
        await app.listen({ port: envConfig.app.port });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

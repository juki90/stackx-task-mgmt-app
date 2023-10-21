import 'reflect-metadata';

import createApp from '@/index';
import { envConfig } from '@/config';
import { en as messages } from '@/locales';
import shutdownServer from '@/utilities/shutdownServer';

import type { Server } from 'http';
import type { Express } from 'express';

const {
    app: { port }
} = envConfig;

(async () => {
    const app = await createApp();

    const server = app.listen(port, () => {
        console.info(`${messages.serverStartedOnPort} ${port}`);
    }) as Server & { app?: Express };

    server.app = app;

    process.on('SIGINT', () => shutdownServer(server));
    process.on('SIGTERM', () => shutdownServer(server));
})();

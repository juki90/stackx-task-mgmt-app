import 'reflect-metadata';
import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

import { appRouter } from '~/router';
import { envConfig } from '~/config';
import useCors from '~/plugins/useCors';
import { createContext } from '~/context';

const app = fastify({
    logger: envConfig.app.env !== 'test'
});

app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
        router: appRouter,
        createContext
    }
});

useCors(app);

export default app;

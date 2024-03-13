import fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

import { appRouter } from '~/router';
import useCors from '~/plugins/useCors';
import { createContext } from '~/context';

const app = fastify({
    logger: true
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

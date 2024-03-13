import cors, {
    FastifyCorsOptions,
    FastifyCorsOptionsDelegate
} from '@fastify/cors';

import { envConfig } from '~/config';

import type { FastifyInstance, FastifyRegisterOptions } from 'fastify';

const useCors = (app: FastifyInstance) => {
    const {
        app: { appUrl, corsSites, frontendUrl }
    } = envConfig;
    const corsWhitelist = corsSites
        .split(',')
        .map((site: string): string => site.trim());
    const originsWhitelist = [appUrl, frontendUrl, ...corsWhitelist];
    const corsOptions = {
        origin(origin, callback) {
            if (originsWhitelist.includes(origin || '') || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        exposedHeaders: ['x-auth-token', 'authorization']
    } as
        | FastifyRegisterOptions<
              FastifyCorsOptions | FastifyCorsOptionsDelegate
          >
        | undefined;

    app.register(cors, corsOptions);
};

export default useCors;

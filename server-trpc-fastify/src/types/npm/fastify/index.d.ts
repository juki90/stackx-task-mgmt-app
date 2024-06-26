import type { User } from '@prisma/client';

declare module 'fastify' {
    interface FastifyRequest {
        loggedUser?: User;
    }
}

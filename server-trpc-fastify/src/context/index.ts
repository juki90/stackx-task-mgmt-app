import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

import initDi from '~/di';

import type { User, Role } from '@prisma/client';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
    const di = await initDi();

    return { req, res, di };
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
    loggedUser?: User & { role: Role };
};

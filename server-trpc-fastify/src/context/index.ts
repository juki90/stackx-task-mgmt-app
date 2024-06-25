import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

import initDi from '~/di';

import type { User, Role } from '@prisma/client';

type CreateFastifyInnerContextOptions = Partial<CreateFastifyContextOptions>;

export function createContextInner(
    opts: CreateFastifyInnerContextOptions = {}
) {
    return opts;
}

export async function createContext({ req, res }: CreateFastifyContextOptions) {
    const di = await initDi();
    const innerContext = createContextInner({});

    return { req, res, di, ...innerContext };
}

export type Context = Awaited<ReturnType<typeof createContext>> & {
    loggedUser?: User & { role: Role };
};

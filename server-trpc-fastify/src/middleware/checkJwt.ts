import { TRPCError } from '@trpc/server';

import { middleware } from '~/router/trpc';

import type { IJwt } from '~/types';

export const checkJwtMiddleware = middleware(async opts => {
    const {
        ctx: {
            di,
            res,
            req: {
                headers: { authorization }
            }
        }
    } = opts;

    const jwtService = di.get<IJwt>('services.jwt');

    const verification = await jwtService.verify(authorization || '');

    if (!verification) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const { refreshedToken, loggedUser } = verification;

    res.header('X-Auth-Token', refreshedToken);

    return opts.next({ ctx: { loggedUser } });
});

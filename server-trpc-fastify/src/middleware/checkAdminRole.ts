import { TRPCError } from '@trpc/server';

import { ROLE } from '~/config/constants';
import { checkJwtMiddleware } from '~/middleware/checkJwt';

export const checkAdminRoleMiddleware = checkJwtMiddleware.unstable_pipe(
    opts => {
        const {
            ctx: { loggedUser }
        } = opts;

        if (loggedUser?.role?.name !== ROLE.NAMES.ADMIN) {
            throw new TRPCError({
                code: 'FORBIDDEN'
            });
        }

        return opts.next();
    }
);

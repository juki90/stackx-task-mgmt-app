import { StatusCodes } from 'http-status-codes';

import { en as messages } from '@/locales';

import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
    const {
        headers: { authorization }
    } = req;
    const di = req.app.get('di');
    const jwtService = di.get('services.jwt');

    const verification = jwtService.verify(authorization);

    if (!verification) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .send(messages.loginSessionExpired);
    }

    const { refreshedToken, role } = verification;

    res.setHeader('X-Auth-Token', refreshedToken);
    req.userRole = role;

    return next();
};

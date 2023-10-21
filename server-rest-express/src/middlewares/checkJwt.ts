import { StatusCodes } from 'http-status-codes';

import { en as messages } from '@/locales';

import type { IJwt } from '@/types';
import type { Container } from 'inversify';
import type { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    const {
        headers: { authorization }
    } = req;
    const di: Container = req.app.get('di');
    const jwtService = di.get<IJwt>('services.jwt');

    const verification = await jwtService.verify(authorization);

    if (!verification) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .send(messages.loginSessionExpired);
    }

    const { refreshedToken, loggedUser } = verification;

    res.setHeader('X-Auth-Token', refreshedToken);
    req.loggedUser = loggedUser;

    return next();
};

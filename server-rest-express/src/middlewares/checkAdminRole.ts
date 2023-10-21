import { StatusCodes } from 'http-status-codes';

import type { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    const isLoggedUserAdmin = await req.loggedUser.checkAdminRole();

    if (isLoggedUserAdmin) {
        return next();
    }

    return res.sendStatus(StatusCodes.FORBIDDEN);
};

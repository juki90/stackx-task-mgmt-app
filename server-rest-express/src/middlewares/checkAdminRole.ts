import { StatusCodes } from 'http-status-codes';

import { ROLE_NAMES } from '@/models/Role';

import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
    if (ROLE_NAMES.ADMIN === req.userRole) {
        return next();
    }

    return res.sendStatus(StatusCodes.FORBIDDEN);
};

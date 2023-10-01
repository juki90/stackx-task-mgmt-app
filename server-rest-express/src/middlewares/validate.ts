import { StatusCodes } from 'http-status-codes';
import {
    matchedData,
    validationResult,
    type ValidationError
} from 'express-validator';

import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = validationResult(req);

    if (validationErrors.isEmpty()) {
        req.body = matchedData(req);

        return next();
    }

    const errors = validationErrors
        .array()
        .map(({ msg, path }: ValidationError & { path: string }) => ({
            message: msg,
            field: path
        }));

    return res.status(StatusCodes.BAD_REQUEST).send({ errors });
};

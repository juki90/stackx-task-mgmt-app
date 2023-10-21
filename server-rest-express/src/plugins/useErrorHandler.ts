import { StatusCodes } from 'http-status-codes';

import { en as messages } from '@/locales';

import type { Express, Request, Response, NextFunction } from 'express';

export default (app: Express) =>
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        const logger = app.get('di').get('services.logger');

        if (error instanceof Error) {
            logger.error(error);

            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(messages.internalServerError);
        }

        return next();
    });

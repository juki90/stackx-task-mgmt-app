import cors from 'cors';

import { envConfig } from '@/config';

import type { Express, Request, Response, NextFunction } from 'express';

const useCors = (app: Express) => {
    const {
        app: { appUrl, corsSites, frontendUrl }
    } = envConfig;
    const corsWhitelist = corsSites
        .split(',')
        .map((site: string): string => site.trim());
    const originsWhitelist = [appUrl, frontendUrl, ...corsWhitelist];
    const corsOptions = {
        origin(
            origin: string,
            callback: (arg0: Error, arg1?: boolean) => void
        ) {
            if (originsWhitelist.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    };

    app.use(cors(corsOptions));
    app.use(
        (err: Error, req: Request, res: Response, next: NextFunction): void => {
            if (err.message !== 'Not allowed by CORS') {
                return next();
            }

            res.status(200).json({
                code: 200,
                message: 'Request not allowed by CORS'
            });
        }
    );
};

export default useCors;

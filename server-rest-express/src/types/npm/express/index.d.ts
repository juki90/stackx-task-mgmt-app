import type { User } from '@/types';

export {};

declare global {
    namespace Express {
        interface Request {
            loggedUser?: User;
            queryParams?: {
                limit?: number;
                offset?: number;
                where?: {
                    [x: string]: {
                        [y: string]: {
                            [i: string]: string;
                        };
                    }[];
                };
            };
            query: {
                page?: {
                    size: number;
                    index: number;
                };
            };
        }
    }
}

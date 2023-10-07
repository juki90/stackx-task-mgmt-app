import type { User, ParsedQs } from '@/types';

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
            query:
                | string
                | string[]
                | ParsedQs
                | ParsedQs[]
                | {
                      [x: string]: {
                          [y: string]: string | number;
                      };
                  };
        }
    }
}

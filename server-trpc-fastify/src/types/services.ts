import { User } from '~/types';

interface ILogger {
    info(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

interface IJwt {
    sign(user: User): string;
    verify(
        authHeader: string
    ): Promise<{ refreshedToken: string; loggedUser: User } | null>;
}

export type { IJwt, ILogger };

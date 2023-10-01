import { User, JsonWebToken } from '@/types';

interface ILogger {
    info(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

interface IJwt {
    jwt: JsonWebToken;
    jwtSecret: string;
    jwtExpiresIn: number;
    sign(user: User): string;
    verify(
        authHeader: string
    ): Promise<{ refreshedToken: string; role: string } | null>;
}

export type { IJwt, ILogger };

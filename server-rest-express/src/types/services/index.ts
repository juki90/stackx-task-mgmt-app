interface ILogger {
    info(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

export type { ILogger };

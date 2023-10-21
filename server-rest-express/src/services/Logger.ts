import { injectable } from 'inversify';

import type { ILogger } from '@/types';

@injectable()
export class Logger implements ILogger {
    info(...args: unknown[]) {
        console.info(...args);
    }

    error(...args: unknown[]) {
        console.error(...args);
    }
}

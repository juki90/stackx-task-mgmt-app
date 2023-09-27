import { envConfig } from 'config';

type EnvConfig = typeof envConfig;
type EnvConfigPostgres = typeof envConfig.postgres;

export type { EnvConfig, EnvConfigPostgres };

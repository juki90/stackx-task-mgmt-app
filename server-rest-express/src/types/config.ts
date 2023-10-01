import { envConfig } from 'config';

type EnvConfig = typeof envConfig;
type EnvConfigPostgres = typeof envConfig.postgres;
type EnvConfigJwt = typeof envConfig.jwt;

export type { EnvConfig, EnvConfigJwt, EnvConfigPostgres };

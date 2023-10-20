import { envConfig } from 'config';

type EnvConfig = typeof envConfig;
type EnvConfigApp = typeof envConfig.app;
type EnvConfigPostgres = typeof envConfig.postgres;
type EnvConfigJwt = typeof envConfig.jwt;

export type { EnvConfig, EnvConfigApp, EnvConfigJwt, EnvConfigPostgres };

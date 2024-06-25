import type { AppRouterInputs, AppRouterOutputs } from '@/plugins/trpc';

type AuthLoginRequest = AppRouterInputs['auth']['login'];
type AuthLoginResponse = AppRouterOutputs['auth']['login'];
type AuthMeResponse = AppRouterOutputs['auth']['me'];

export type { AuthMeResponse, AuthLoginRequest, AuthLoginResponse };

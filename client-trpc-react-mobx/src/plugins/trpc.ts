import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '~/router';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
    createTRPCReact<AppRouter>();

type AppRouterInputs = inferRouterInputs<AppRouter>;
type AppRouterOutputs = inferRouterOutputs<AppRouter>;

export type { AppRouter, AppRouterInputs, AppRouterOutputs };

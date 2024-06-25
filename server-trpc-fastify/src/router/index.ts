import { router } from '~/router/trpc';
import { authRouter } from '~/router/routers/auth';
import { tasksRouter } from '~/router/routers/tasks';
import { usersRouter } from '~/router/routers/users';

export const appRouter = router({
    auth: authRouter,
    users: usersRouter,
    tasks: tasksRouter
});

type AppRouter = typeof appRouter;

export type { AppRouter };

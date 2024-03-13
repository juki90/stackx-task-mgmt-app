import { router } from '~/router/trpc';
import { meProcedure } from '~/procedures/auth/meProcedure';
import { loginProcedure } from '~/procedures/auth/loginProcedure';

export const authRouter = router({
    login: loginProcedure,
    me: meProcedure
});

import { router } from '~/router/trpc';
import { showUserProcedure } from '~/procedures/users/showProcedure';
import { fetchUsersProcedure } from '~/procedures/users/fetchProcedure';
import { createUserProcedure } from '~/procedures/users/createProcedure';
import { updateUserProcedure } from '~/procedures/users/updateProcedure';
import { deleteUserProcedure } from '~/procedures/users/deleteProcedure';

export const usersRouter = router({
    show: showUserProcedure,
    fetch: fetchUsersProcedure,
    create: createUserProcedure,
    update: updateUserProcedure,
    delete: deleteUserProcedure
});

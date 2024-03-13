import type { Prisma } from '@prisma/client';
import type { Role } from '~/types/models/Role';
import type { User, PrismaUser } from '~/types/models/User';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import type { Task, PrismaTask, TaskUsersStatus } from '~/types/models/Task';

type TModel = User | Task | Role;

type TModelObjectNames = 'user' | 'task' | 'role';

type TModelDelegate =
    | Prisma.UserDelegate<DefaultArgs>
    | Prisma.TaskDelegate<DefaultArgs>
    | Prisma.RoleDelegate<DefaultArgs>;

export type {
    Role,
    User,
    Task,
    TModel,
    PrismaUser,
    PrismaTask,
    TModelDelegate,
    TaskUsersStatus,
    TModelObjectNames
};

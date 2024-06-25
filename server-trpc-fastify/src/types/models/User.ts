import type { Task, Role } from '~/types';
import type { Prisma, User as PrismaUser } from '@prisma/client';

type User = Prisma.UserGetPayload<true> & {
    fullName: string;
    createdBy?: User;
    tasks?: Task[];
    role?: Role;
};

export { User, PrismaUser };

import type { User } from '~/types';
import type { Prisma, Task as PrismaTask } from '@prisma/client';

type TaskUsersStatus = {
    userId: string;
    doneAt: Date | string | null;
}[];

type Task = Omit<Prisma.TaskGetPayload<true>, 'usersStatus'> & {
    usersStatus: TaskUsersStatus;
} & {
    fullName: string;
    createdBy?: User;
    updatedBy?: User;
    users?: User[];
};

export { Task, PrismaTask, TaskUsersStatus };

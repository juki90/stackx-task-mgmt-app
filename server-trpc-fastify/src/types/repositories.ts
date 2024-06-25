import type { Prisma } from '@prisma/client';
import type { User, Task, Role, TPrisma } from '~/types';
import type { DefaultArgs } from '@prisma/client/runtime/library';

interface IAbstractRepository<T> {
    readonly db: TPrisma;
    readonly model: T;

    findMany(options?: any): Promise<any[]>;
    findById(id: string, options?: any): Promise<any>;
    findOne(options?: any): Promise<any>;
    create(options?: any): Promise<any>;
    update(options?: any): Promise<any>;
    delete(options?: any): Promise<any>;
    count(options?: any): Promise<any>;
    upsert(options?: any): Promise<any>;
}

interface IUserRepository
    extends IAbstractRepository<Prisma.UserDelegate<DefaultArgs>> {
    get model(): Prisma.UserDelegate<DefaultArgs>;

    findByEmail(email: string, options?: any): Promise<User | null>;
    findMany(options?: any): Promise<User[]>;
    findById(id: string, options?: any): Promise<User | null>;
    findOne(options?: any): Promise<User | null>;
    create(options?: any): Promise<User>;
    update(options?: any): Promise<User>;
    count(options?: any): Promise<number>;
    upsert(options?: any): Promise<User>;
}

interface ITaskRepository
    extends IAbstractRepository<Prisma.TaskDelegate<DefaultArgs>> {
    get model(): Prisma.TaskDelegate<DefaultArgs>;

    findMany(options?: any): Promise<Task[]>;
    findById(id: string, options?: any): Promise<Task | null>;
    findOne(options?: any): Promise<Task | null>;
    create(options?: any): Promise<Task>;
    update(options?: any): Promise<Task>;
    delete(options?: any): Promise<Task>;
    count(options?: any): Promise<number>;
    upsert(options?: any): Promise<Task>;
}

interface IRoleRepository
    extends IAbstractRepository<Prisma.RoleDelegate<DefaultArgs>> {
    get model(): Prisma.RoleDelegate<DefaultArgs>;
    findOne(options?: any): Promise<Role | null>;
    upsert(options?: any): Promise<Role>;
}

export type {
    IUserRepository,
    ITaskRepository,
    IRoleRepository,
    IAbstractRepository
};

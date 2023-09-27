import type { FindOptions } from 'sequelize';
import type { User, Role, Sequelize } from '@/types';
import type { Repository } from 'sequelize-typescript';

interface IAbstractRepository<T> {
    readonly db: Sequelize;
    get repository(): Repository<T>;
    create(data: Omit<T, 'id'>): Promise<T>;
    findAll(filter: FindOptions<T>): Promise<T[]>;
    findOne(filter: FindOptions<T>): Promise<T | null>;
}

interface IRoleRepository extends IAbstractRepository<Role> {
    get repository(): Repository<Role>;
}

interface IUserRepository extends IAbstractRepository<User> {
    get repository(): Repository<User>;
}

export type { IRoleRepository, IUserRepository, IAbstractRepository };

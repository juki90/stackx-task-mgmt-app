import type { User, Role, Sequelize, Task } from '@/types';
import type { MakeNullishOptional } from 'sequelize/types/utils';
import type {
    Model,
    Attributes,
    FindOptions,
    ModelStatic,
    UpdateOptions,
    CreateOptions,
    InferAttributes,
    InferCreationAttributes
} from 'sequelize';

interface IAbstractRepository<
    T extends Model<InferAttributes<T>, InferCreationAttributes<T>>
> {
    readonly db: Sequelize;
    get model(): ModelStatic<T>;
    create(
        data: MakeNullishOptional<T>,
        options?: CreateOptions<Attributes<T>>
    ): Promise<T>;
    updateById(
        id: string,
        data: MakeNullishOptional<T>,
        options: UpdateOptions<Attributes<T>>
    ): Promise<[affectedCount: number]>;
    findAll(options?: FindOptions<T>): Promise<T[]>;
    findOne(options: FindOptions<T>): Promise<T | null>;
    findById(id: string, options?: FindOptions<T>): Promise<T | null>;
}

interface IRoleRepository extends IAbstractRepository<Role> {
    get model(): ModelStatic<Role>;
}

interface IUserRepository extends IAbstractRepository<User> {
    get model(): ModelStatic<User>;
    findByEmail(
        email: string,
        options?: FindOptions<User>
    ): Promise<User | null>;
}

interface ITaskRepository extends IAbstractRepository<Task> {
    get model(): ModelStatic<Task>;
}

export type {
    IRoleRepository,
    IUserRepository,
    ITaskRepository,
    IAbstractRepository
};

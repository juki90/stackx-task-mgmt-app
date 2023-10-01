import type { User, Role, Sequelize } from '@/types';
import type { MakeNullishOptional } from 'sequelize/types/utils';
import type {
    Model,
    FindOptions,
    ModelStatic,
    InferAttributes,
    InferCreationAttributes
} from 'sequelize';

interface IAbstractRepository<
    T extends Model<InferAttributes<T>, InferCreationAttributes<T>>
> {
    readonly db: Sequelize;
    get model(): ModelStatic<T>;
    create(data: MakeNullishOptional<T>): Promise<T>;
    findAll(options?: FindOptions<T>): Promise<T[]>;
    findOne(options: FindOptions<T>): Promise<T | null>;
    findById(id: string, options: FindOptions<T>): Promise<T | null>;
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

export type { IRoleRepository, IUserRepository, IAbstractRepository };

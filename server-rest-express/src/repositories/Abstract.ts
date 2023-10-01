import { inject, injectable } from 'inversify';

import type { Sequelize, IAbstractRepository } from '@/types';
import type { MakeNullishOptional } from 'sequelize/types/utils';
import type {
    Model,
    ModelStatic,
    FindOptions,
    InferAttributes,
    InferCreationAttributes
} from 'sequelize';

@injectable()
export abstract class AbstractRepository<
    T extends Model<InferAttributes<T>, InferCreationAttributes<T>>
> implements IAbstractRepository<T>
{
    constructor(@inject('services.sequelize') readonly db: Sequelize) {
        this.db = db;
    }

    abstract get model(): ModelStatic<T>;

    create(data: MakeNullishOptional<T>): Promise<T> {
        return this.model.create(data);
    }

    findAll(options: FindOptions<T> = {}): Promise<T[]> {
        return this.model.findAll(options);
    }

    findOne(options: FindOptions<T>): Promise<T | null> {
        return this.model.findOne(options);
    }

    findById(id: string, options: FindOptions<T>): Promise<T | null> {
        return this.model.findByPk(id, options);
    }
}

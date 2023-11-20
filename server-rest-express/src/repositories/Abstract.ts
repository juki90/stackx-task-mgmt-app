import deepMerge from 'deepmerge';
import { inject, injectable } from 'inversify';

import type { Sequelize, IAbstractRepository } from '@/types';
import type { MakeNullishOptional } from 'sequelize/types/utils';
import type {
    Model,
    Attributes,
    ModelStatic,
    FindOptions,
    CountOptions,
    CreateOptions,
    UpdateOptions,
    InferAttributes,
    FindAndCountOptions,
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

    create(
        data: MakeNullishOptional<T>,
        options: CreateOptions<Attributes<T>> = {}
    ): Promise<T> {
        return this.model.create(data, options);
    }

    updateById(
        id: string,
        data: MakeNullishOptional<T>,
        options: UpdateOptions<Attributes<T>> = { where: {} }
    ): Promise<[affectedCount: number]> {
        const finalOptions = deepMerge(options, { where: { id } });

        return this.model.update(data, finalOptions);
    }

    findAll(options: FindOptions<T> = {}): Promise<T[]> {
        return this.model.findAll(options);
    }

    findAndCount(
        options: FindAndCountOptions<T> = {}
    ): Promise<{ rows: T[]; count: number }> {
        return this.model.findAndCountAll(options);
    }

    findOne(options: FindOptions<T>): Promise<T | null> {
        return this.model.findOne(options);
    }

    findById(id: string, options: FindOptions<T> = {}): Promise<T | null> {
        const finalOptions = deepMerge(options, { where: { id } });

        return this.model.findOne(finalOptions);
    }

    count(options: CountOptions = {}) {
        return this.model.count(options);
    }
}

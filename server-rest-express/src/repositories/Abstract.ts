import { inject, injectable } from 'inversify';

import type { Repository } from 'sequelize-typescript';
import type { FindOptions, Attributes } from 'sequelize';
import type { TModel, Sequelize, IAbstractRepository } from '@/types';

@injectable()
export abstract class AbstractRepository
    implements IAbstractRepository<TModel>
{
    constructor(@inject('sequelize') readonly db: Sequelize) {
        this.db = db;
    }

    abstract get repository(): Repository<TModel>;

    create(data: Omit<TModel, 'id'>): Promise<Attributes<TModel>> {
        return this.repository.create(data);
    }

    findAll(filter: FindOptions<TModel>): Promise<Attributes<TModel>[]> {
        return this.repository.findAll(filter);
    }

    findOne(filter: FindOptions<TModel>): Promise<Attributes<TModel> | null> {
        return this.repository.findOne(filter);
    }
}

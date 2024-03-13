import deepMerge from 'deepmerge';
import { inject, injectable } from 'inversify';

import type { TPrisma, IAbstractRepository } from '~/types';

@injectable()
export abstract class AbstractRepository<T> implements IAbstractRepository<T> {
    constructor(@inject('%prisma') readonly db: TPrisma) {}

    abstract readonly model: any;

    findMany(options: any): Promise<any[]> {
        return this.model.findMany(options);
    }

    findById(id: string, options: any = {}): Promise<any> {
        const finalOptions = deepMerge(options, { where: { id } });

        return this.model.findUnique(finalOptions);
    }

    findOne(options: any = {}): Promise<any> {
        return this.model.findFirst(options);
    }

    create(payload: any): Promise<any> {
        return this.model.create(payload);
    }

    update(options: any): Promise<any> {
        return this.model.update(options);
    }

    delete(options: any): Promise<any> {
        return this.model.delete(options);
    }

    count(options: any = {}): Promise<number> {
        return this.model.count(options);
    }
}

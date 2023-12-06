import * as deepMerge from 'deepmerge';
import { Injectable } from '@nestjs/common';

import type {
    Repository,
    SaveOptions,
    DeepPartial,
    FindOneOptions,
    FindManyOptions
} from 'typeorm';

@Injectable()
export abstract class AbstractRepository<T extends { id: string }> {
    protected abstract readonly repository: Repository<T>;

    findAll(options: FindManyOptions<T> = {}): Promise<T[]> {
        return this.repository.find(options);
    }

    findAllAndCount(options: FindManyOptions<T> = {}): Promise<[T[], number]> {
        return this.repository.findAndCount(options);
    }

    findOne(options: FindOneOptions<T> = {}): Promise<T | null> {
        return this.repository.findOne(options);
    }

    findById(id: string, options: FindOneOptions<T> = {}): Promise<T | null> {
        const finalOptions = deepMerge(options, { where: { id } });

        return this.repository.findOne(finalOptions);
    }

    create(createInput: DeepPartial<T>, options: SaveOptions = {}): Promise<T> {
        const created = this.repository.create(createInput);

        return this.repository.save(created, options);
    }

    async update(id: string, updateInput: DeepPartial<T>): Promise<T> {
        const preloaded = await this.repository.preload({
            id,
            ...updateInput
        });

        return this.repository.save(preloaded);
    }

    async delete(id: string): Promise<T> {
        const removable = await this.findById(id);

        if (!removable) {
            return null;
        }

        const removed = await this.repository.remove(removable);

        if (!removed.id) {
            removed.id = id;
        }

        return removed;
    }

    createQueryBuilder(model: string) {
        return this.repository.createQueryBuilder(model);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from '@/entities/Task';
import { AbstractRepository } from '@/repositories/Abstract';

import type { Repository } from 'typeorm';

@Injectable()
export class TaskRepository extends AbstractRepository<Task> {
    constructor(
        @InjectRepository(Task)
        protected readonly repository: Repository<Task>
    ) {
        super();
    }
}

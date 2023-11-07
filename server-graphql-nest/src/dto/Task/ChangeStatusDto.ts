import { IsIn } from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';
import { TASK_STATUSES } from '@/entities/Task';

export class ChangeTaskStatusInputDto extends GraphQlTypes.ChangeTaskStatusInput {
    @IsIn([TASK_STATUSES.CANCELLED, TASK_STATUSES.DONE], {
        message: messages.validators.tasks.notAllowedTaskStatus
    })
    status: number;
}

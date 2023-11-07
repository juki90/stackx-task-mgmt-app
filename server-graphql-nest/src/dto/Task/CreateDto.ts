import {
    IsUUID,
    MinLength,
    MaxLength,
    IsOptional,
    ArrayMinSize
} from 'class-validator';

import { en as messages } from '@/locales';
import * as GraphQlTypes from '@/graphql';

export class CreateTaskInputDto extends GraphQlTypes.CreateTaskInput {
    @MinLength(2, { message: messages.validators.tasks.titleIncorrectLength })
    @MaxLength(128, { message: messages.validators.tasks.titleIncorrectLength })
    title: string;

    @IsOptional()
    @MaxLength(3000, {
        message: messages.validators.tasks.descriptionIncorrectLength
    })
    description: string;

    @IsUUID('4', {
        message: messages.validators.shared.fieldShouldBeUuid,
        each: true
    })
    @ArrayMinSize(1, {
        message: messages.validators.tasks.userIdsIncorrectAmount
    })
    userIds: string[];
}

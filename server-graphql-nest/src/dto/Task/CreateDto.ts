import {
    IsUUID,
    IsArray,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsNotEmpty,
    ArrayMinSize
} from 'class-validator';

import { en as messages } from '@/locales';
import * as GraphQlTypes from '@/graphql';

export class CreateTaskInputDto extends GraphQlTypes.CreateTaskInput {
    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @MinLength(2, { message: messages.validators.tasks.titleIncorrectLength })
    @MaxLength(128, { message: messages.validators.tasks.titleIncorrectLength })
    title: string;

    @IsOptional()
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @MaxLength(3000)
    description: string;

    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsArray({ message: messages.validators.shared.fieldShouldBeArray })
    @IsUUID('4', { each: true })
    @ArrayMinSize(1, {
        message: messages.validators.tasks.userIdsIncorrectAmount
    })
    userIds: string[];
}

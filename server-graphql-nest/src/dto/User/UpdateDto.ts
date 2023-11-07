import {
    IsEmail,
    MinLength,
    MaxLength,
    IsBoolean,
    IsOptional
} from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';

export class UpdateUserInputDto extends GraphQlTypes.UpdateUserInput {
    @MinLength(2, {
        message: messages.validators.users.nameIncorrectLength
    })
    @MaxLength(32, {
        message: messages.validators.users.nameIncorrectLength
    })
    firstName: string;

    @MinLength(2, {
        message: messages.validators.users.nameIncorrectLength
    })
    @MaxLength(32, {
        message: messages.validators.users.nameIncorrectLength
    })
    lastName: string;

    @IsEmail(undefined, {
        message: messages.validators.shared.fieldShouldBeAnEmail
    })
    email: string;

    @IsOptional()
    @MinLength(8, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    @MaxLength(64, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    password: string;

    @IsBoolean({ message: messages.validators.shared.fieldShouldBeBoolean })
    isAdmin: boolean;
}

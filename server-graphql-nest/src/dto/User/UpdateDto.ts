import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsBoolean,
    IsOptional,
    IsNotEmpty
} from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';

export class UpdateUserInputDto extends GraphQlTypes.UpdateUserInput {
    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @MinLength(2, {
        message: messages.validators.users.nameIncorrectLength
    })
    @MaxLength(32, {
        message: messages.validators.users.nameIncorrectLength
    })
    firstName: string;

    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @MinLength(2, {
        message: messages.validators.users.nameIncorrectLength
    })
    @MaxLength(32, {
        message: messages.validators.users.nameIncorrectLength
    })
    lastName: string;

    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @IsEmail(undefined, {
        message: messages.validators.shared.fieldShouldBeAnEmail
    })
    email: string;

    @IsOptional()
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @MinLength(8, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    @MaxLength(64, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    password: string;

    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsBoolean({ message: messages.validators.shared.fieldShouldBeBoolean })
    isAdmin: boolean;
}

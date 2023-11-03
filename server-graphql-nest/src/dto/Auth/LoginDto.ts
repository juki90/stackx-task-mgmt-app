import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsNotEmpty
} from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';

export class LoginInputDto extends GraphQlTypes.LoginInput {
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
}

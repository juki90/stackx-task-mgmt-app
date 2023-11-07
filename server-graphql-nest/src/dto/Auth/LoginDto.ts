import { IsEmail, MinLength, MaxLength } from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';

export class LoginInputDto extends GraphQlTypes.LoginInput {
    @IsEmail(undefined, {
        message: messages.validators.shared.fieldShouldBeAnEmail
    })
    email: string;

    @MinLength(8, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    @MaxLength(64, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    password: string;
}

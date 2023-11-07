import { MinLength, MaxLength } from 'class-validator';

import { en as messages } from '@/locales';
import { UpdateUserInputDto } from '@/dto/User/UpdateDto';

export class CreateUserInputDto extends UpdateUserInputDto {
    @MinLength(8, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    @MaxLength(64, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    password: string;
}

import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

import { en as messages } from '@/locales';
import { UpdateUserInputDto } from '@/dto/User/UpdateDto';

export class CreateUserInputDto extends UpdateUserInputDto {
    @IsNotEmpty({ message: messages.validators.shared.fieldShouldNotBeEmpty })
    @IsString({ message: messages.validators.shared.fieldShouldBeString })
    @MinLength(8, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    @MaxLength(64, {
        message: messages.validators.shared.incorrectPasswordLength
    })
    password: string;
}

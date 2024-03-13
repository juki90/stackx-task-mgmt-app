import * as yup from 'yup';
import { en as messages } from '@/locales';

export const loginValidationSchema = yup
    .object({
        email: yup
            .string()
            .email(messages.validators.shared.fieldShouldBeAnEmail)
            .required(messages.validators.shared.fieldShouldNotBeEmpty),
        password: yup
            .string()
            .min(8, messages.validators.shared.incorrectPasswordLength)
            .max(64, messages.validators.shared.incorrectPasswordLength)
            .required(messages.validators.shared.fieldShouldNotBeEmpty)
    })
    .required();

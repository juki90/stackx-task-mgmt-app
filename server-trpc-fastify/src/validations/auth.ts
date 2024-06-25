import { z } from 'zod';

import { en as messages } from '~/locales';

export const loginValidation = z.object({
    email: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
        .email({ message: messages.validators.shared.fieldShouldBeAnEmail }),
    password: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
        .min(8, messages.validators.shared.incorrectPasswordLength)
        .max(32, messages.validators.shared.incorrectPasswordLength)
});

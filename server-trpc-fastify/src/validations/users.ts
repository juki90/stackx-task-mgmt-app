import { z } from 'zod';

import { en as messages } from '~/locales';

const sharedObject = {
    firstName: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
        .min(2, messages.validators.users.nameIncorrectLength)
        .max(32, messages.validators.users.nameIncorrectLength),

    lastName: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
        .min(2, messages.validators.users.nameIncorrectLength)
        .max(32, messages.validators.users.nameIncorrectLength),

    email: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
        .email({ message: messages.validators.shared.fieldShouldBeAnEmail }),

    isAdmin: z.boolean({
        invalid_type_error: messages.validators.shared.fieldShouldBeBoolean
    })
};

const passwordCreateValidation = z
    .string({
        required_error: messages.validators.shared.fieldShouldNotBeEmpty,
        invalid_type_error: messages.validators.shared.fieldShouldBeString
    })
    .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
    .min(8, messages.validators.shared.incorrectPasswordLength)
    .max(32, messages.validators.shared.incorrectPasswordLength);

const createObject = {
    ...sharedObject,
    password: passwordCreateValidation
};

const idObject = {
    id: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
};

const updateObject = {
    ...idObject,
    ...sharedObject,
    password: passwordCreateValidation.optional().or(z.literal(''))
};

export const userCreateValidation = z.object(createObject);
export const userUpdateValidation = z.object(updateObject);
export const userDeleteValidation = z.object(idObject);

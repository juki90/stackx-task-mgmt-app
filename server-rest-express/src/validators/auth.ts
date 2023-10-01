import { body } from 'express-validator';

import { en as messages } from '@/locales';
import isEmail from '@/validators/utilities/isEmail';

export const loginValidator = [
    body('email')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .custom(isEmail)
        .withMessage(messages.validators.auth.fieldShouldBeAnEmail),

    body('password')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isLength({ min: 8, max: 64 })
        .withMessage(messages.validators.auth.passwordWithIncorrectLength)
];

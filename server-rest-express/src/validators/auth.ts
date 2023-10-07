import { body } from 'express-validator';

import { en as messages } from '@/locales';
import isEmail from '@/validators/utilities/isEmail';

const login = [
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
        .withMessage(messages.validators.shared.fieldShouldBeAnEmail),

    body('password')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isLength({ min: 8, max: 32 })
        .withMessage(messages.validators.auth.passwordWithIncorrectLength)
];

export default { login };

import { body, query, param } from 'express-validator';

import { en as messages } from '@/locales';
import isEmail from '@/validators/utilities/isEmail';
import sanitizeQueryObject from '@/validators/utilities/sanitizeQueryObject';
import { validatePageSizeAndIndex } from '@/validators/utilities/customQueryValidator';

const fetch = [
    query('page')
        .optional()
        .customSanitizer(sanitizeQueryObject)
        .isObject()
        .withMessage(messages.validators.shared.fetchParamShouldBeObject)
        .bail()
        .custom(validatePageSizeAndIndex),

    query('filter')
        .optional()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
];

const create = [
    body('firstName')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isLength({ min: 2, max: 32 })
        .withMessage(messages.validators.users.nameIncorrectLength),

    body('lastName')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isLength({ min: 2, max: 32 })
        .withMessage(messages.validators.users.nameIncorrectLength),

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
        .withMessage(messages.validators.shared.fieldShouldBeAnEmail)
        .custom(async (email, { req }) => {
            const di = req.app.get('di');
            const userRepository = di.get('repositories.user');

            const user = await userRepository.findByEmail(email, { raw: true });

            if (user && req.params.id !== user.id) {
                return Promise.reject(
                    messages.validators.users.userWithThisEmailExists
                );
            }

            return true;
        }),

    body('password')
        .custom((password, { req }) => req.method === 'PUT' || password)
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .isLength({ min: 8, max: 32 })
        .withMessage(messages.validators.shared.incorrectPasswordLength),

    body('isAdmin')
        .isBoolean()
        .withMessage(messages.validators.shared.fieldShuoldBeBoolean)
];

const remove = [
    param('id')
        .isUUID()
        .withMessage(messages.validators.shared.fieldShouldBeUuid)
];

const update = [...create, ...remove];

const show = remove;

export default { create, update, fetch, remove, show };

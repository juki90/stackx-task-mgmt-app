import { body, query } from 'express-validator';

import { en as messages } from '@/locales';
import isEmail from '@/validators/utilities/isEmail';
import sanitizeQueryObject from '@/validators/utilities/sanitizeQueryObject';

const fetch = [
    query('page')
        .optional()
        .customSanitizer(sanitizeQueryObject)
        .isObject()
        .withMessage(messages.validators.shared.fetchParamShouldBeObject)
        .bail()
        .custom(({ size, index }) => {
            if (!size && size !== 0) {
                throw new Error(
                    messages.validators.shared.pageSizeShouldNotBeEmpty
                );
            }

            if (isNaN(parseInt(size))) {
                throw new Error(
                    messages.validators.shared.pageSizeShouldBeInteger
                );
            }

            if (size < 1 && size > 50) {
                throw new Error(
                    messages.validators.shared.pageSizeShouldBeCorrectRange
                );
            }

            if (!index && index !== 0) {
                throw new Error(
                    messages.validators.shared.pageIndexShouldNotBeEmpty
                );
            }

            if (isNaN(parseInt(index))) {
                throw new Error(
                    messages.validators.shared.pageIndexShouldBeInteger
                );
            }

            if (index < 0) {
                throw new Error(
                    messages.validators.shared.pageIndexShouldBeCorrectRange
                );
            }

            return true;
        }),

    query('filter').optional()
];

const save = [
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
        }),

    body('password')
        .custom((password, { req }) => req.method === 'PUT' || password)
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .isLength({ min: 8, max: 32 })
        .withMessage(messages.validators.users.incorrectPasswordLength),

    body('isAdmin')
        .isBoolean()
        .withMessage(messages.validators.shared.fieldShuoldBeBoolean)
];

export default { save, fetch };

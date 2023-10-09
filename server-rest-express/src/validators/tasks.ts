import { body, param, query } from 'express-validator';

import { en as messages } from '@/locales';
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
    body('title')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isLength({ min: 2, max: 128 })
        .withMessage(messages.validators.tasks.titleIncorrectLength),

    body('description')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .isLength({ min: 0, max: 3000 })
        .withMessage(messages.validators.tasks.descriptionIncorrectLength),

    body('userIds')
        .isArray({ min: 1, max: 50 })
        .withMessage(messages.validators.tasks.userIdsIncorrectAmount),

    body('userIds.*')
        .isString()
        .withMessage(messages.validators.shared.fieldShouldBeString)
        .bail()
        .trim()
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isUUID()
        .withMessage(messages.validators.shared.fieldShouldBeUuid)
];

const remove = [
    param('id')
        .isUUID()
        .withMessage(messages.validators.shared.fieldShouldBeUuid)
];

const update = [...create, ...remove];

export default { create, update, remove, fetch };

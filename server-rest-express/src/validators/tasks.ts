import { body, param, query } from 'express-validator';

import { en as messages } from '@/locales';
import { TASK_STATUSES } from '@/models/Task';
import sanitizeQueryObject from '@/validators/utilities/sanitizeQueryObject';
import { validatePageSizeAndIndex } from '@/validators/utilities/customQueryValidator';

const fetch = [
    query('page')
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
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

const changeStatus = [
    ...remove,

    body('status')
        .not()
        .isEmpty()
        .withMessage(messages.validators.shared.fieldShouldNotBeEmpty)
        .bail()
        .isInt()
        .withMessage(messages.validators.shared.fieldShouldBeInteger)
        .bail()
        .isIn([TASK_STATUSES.CANCELLED, TASK_STATUSES.DONE])
        .withMessage(messages.validators.tasks.notAllowedTaskStatus)
];

const show = remove;

const update = [...create, ...remove];

export default { create, update, remove, fetch, show, changeStatus };

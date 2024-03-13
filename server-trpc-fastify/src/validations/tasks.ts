import { z } from 'zod';

import { TASK } from '~/config/constants';
import { en as messages } from '~/locales';

const sharedObject = {
    title: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
        .min(2, messages.validators.tasks.titleIncorrectLength)
        .max(128, messages.validators.tasks.titleIncorrectLength),

    description: z
        .string({
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .max(3000, messages.validators.tasks.descriptionIncorrectLength),

    userIds: z
        .array(
            z.string({
                invalid_type_error:
                    messages.validators.shared.fieldShouldBeString
            }),
            {
                invalid_type_error:
                    messages.validators.shared.fieldShouldBeArray
            }
        )
        .min(1, messages.validators.tasks.userIdsIncorrectAmount)
        .max(50, messages.validators.tasks.userIdsIncorrectAmount)
};

const idObject = {
    id: z
        .string({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
};

const statusObject = {
    ...idObject,
    status: z
        .number({
            required_error: messages.validators.shared.fieldShouldNotBeEmpty,
            invalid_type_error: messages.validators.tasks.notAllowedTaskStatus
        })
        .min(
            TASK.STATUS.CANCELLED,
            messages.validators.tasks.notAllowedTaskStatus
        )
        .max(TASK.STATUS.DONE, messages.validators.tasks.notAllowedTaskStatus)
};

const createObject = {
    ...sharedObject
};

const updateObject = {
    ...idObject,
    ...sharedObject
};

export const taskCreateValidation = z.object(createObject);
export const taskUpdateValidation = z.object(updateObject);
export const taskChangeStatusValidation = z.object(statusObject);
export const taskDeleteValidation = z.object(idObject);

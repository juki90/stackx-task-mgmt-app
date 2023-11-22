import * as yup from 'yup';

import { en as messages } from '@/locales';

import type { AnyObject, ArraySchema, ObjectSchema, StringSchema } from 'yup';
import type { TaskCreateRequest, TaskUpdateRequest } from '@/types';

const schemaObject: {
    id: StringSchema<string | undefined, AnyObject, undefined, ''>;
    title: StringSchema<string, AnyObject, undefined, ''>;
    description: StringSchema<string | undefined, AnyObject, undefined, ''>;
    userIds: ArraySchema<string[], AnyObject, undefined, ''>;
} = {
    id: yup.string().optional(),
    title: yup
        .string()
        .min(2, messages.validators.tasks.titleIncorrectLength)
        .max(128, messages.validators.tasks.titleIncorrectLength)
        .required(messages.validators.shared.fieldShouldNotBeEmpty),
    description: yup
        .string()
        .max(3000, messages.validators.tasks.descriptionIncorrectLength)
        .optional(),
    userIds: yup
        .array(yup.string().required())
        .min(1, messages.validators.tasks.userIdsIncorrectAmount)
        .max(50, messages.validators.tasks.userIdsIncorrectAmount)
        .required()
};

export const createOrUpdateTaskValidationSchema = yup
    .object(schemaObject)
    .required() as ObjectSchema<TaskCreateRequest | TaskUpdateRequest>;

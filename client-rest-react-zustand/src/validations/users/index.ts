import * as yup from 'yup';
import cloneDeep from 'clone-deep';

import { en as messages } from '@/locales';

import type { UserCreateRequest, UserUpdateRequest } from '@/types';
import type { AnyObject, ObjectSchema, StringSchema } from 'yup';

const sharedSchemaObject: {
    id: StringSchema<string | undefined, AnyObject, undefined, ''>;
    firstName: StringSchema<string, AnyObject, undefined, ''>;
    lastName: StringSchema<string, AnyObject, undefined, ''>;
    email: StringSchema<string, AnyObject, undefined, ''>;
    isAdmin: yup.BooleanSchema<boolean, AnyObject, undefined, ''>;
    password?: StringSchema<string | undefined, AnyObject, undefined, ''>;
} = {
    id: yup.string().optional(),
    firstName: yup
        .string()
        .min(2, messages.validators.users.nameIncorrectLength)
        .max(32, messages.validators.users.nameIncorrectLength)
        .required(messages.validators.shared.fieldShouldNotBeEmpty),
    lastName: yup
        .string()
        .min(2, messages.validators.users.nameIncorrectLength)
        .max(32, messages.validators.users.nameIncorrectLength)
        .required(messages.validators.shared.fieldShouldNotBeEmpty),
    email: yup
        .string()
        .email(messages.validators.shared.fieldShouldBeAnEmail)
        .required(messages.validators.shared.fieldShouldNotBeEmpty),
    isAdmin: yup.boolean().required()
};

const passwordSchemaRequired = yup
    .string()
    .min(8, messages.validators.shared.incorrectPasswordLength)
    .max(64, messages.validators.shared.incorrectPasswordLength)
    .required();

const updateUserWithPasswordSchemaObject = cloneDeep(sharedSchemaObject);
const updateUserNoPasswordSchemaObject = cloneDeep(sharedSchemaObject);
const createUserSchemaObject = cloneDeep(sharedSchemaObject);

createUserSchemaObject.password = passwordSchemaRequired;
updateUserWithPasswordSchemaObject.password = passwordSchemaRequired;

export const createUserValidationSchema = yup
    .object(createUserSchemaObject)
    .required() as ObjectSchema<UserCreateRequest>;

export const updateUserWithPasswordValidationSchema = yup
    .object(updateUserWithPasswordSchemaObject)
    .required() as ObjectSchema<UserUpdateRequest>;

export const updateUserNoPasswordValidationSchema = yup
    .object(updateUserNoPasswordSchemaObject)
    .required() as ObjectSchema<UserUpdateRequest>;

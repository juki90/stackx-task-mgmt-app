import { z } from 'zod';

import { en as messages } from '~/locales';

export const sharedFetchValidation = z.object({
    filter: z
        .string({
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .optional(),
    page: z.object(
        {
            size: z
                .number({
                    invalid_type_error:
                        messages.validators.shared.pageSizeShouldBeInteger
                })
                .min(1, messages.validators.shared.pageSizeShouldBeCorrectRange)
                .max(
                    50,
                    messages.validators.shared.pageSizeShouldBeCorrectRange
                ),
            index: z
                .number({
                    invalid_type_error:
                        messages.validators.shared.pageIndexShouldBeInteger
                })
                .min(
                    0,
                    messages.validators.shared.pageIndexShouldBeCorrectRange
                )
        },
        {
            required_error: messages.validators.shared.fetchParamShouldBeObject,
            invalid_type_error:
                messages.validators.shared.fetchParamShouldBeObject
        }
    )
});

export const sharedShowValidation = z.object({
    id: z
        .string({
            invalid_type_error: messages.validators.shared.fieldShouldBeString
        })
        .min(1, messages.validators.shared.fieldShouldNotBeEmpty)
});

export const sharedDeleteValidation = { ...sharedShowValidation };

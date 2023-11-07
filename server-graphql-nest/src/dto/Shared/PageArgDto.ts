import { Min, Max } from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';

export class PageArgsInputDto extends GraphQlTypes.PageArg {
    @Min(1, {
        message: messages.validators.shared.pageSizeShouldBeCorrectRange
    })
    @Max(50, {
        message: messages.validators.shared.pageSizeShouldBeCorrectRange
    })
    size: number;

    @Min(0, {
        message: messages.validators.shared.pageIndexShouldBeCorrectRange
    })
    index: number;
}

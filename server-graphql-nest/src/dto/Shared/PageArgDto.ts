import { Min, Max, IsInt, IsNotEmpty } from 'class-validator';

import * as GraphQlTypes from '@/graphql';
import { en as messages } from '@/locales';

export class PageArgsInputDto extends GraphQlTypes.PageArg {
    @IsNotEmpty({
        message: messages.validators.shared.pageSizeShouldNotBeEmpty
    })
    @IsInt({ message: messages.validators.shared.pageSizeShouldBeInteger })
    @Min(1, {
        message: messages.validators.shared.pageSizeShouldBeCorrectRange
    })
    @Max(50, {
        message: messages.validators.shared.pageSizeShouldBeCorrectRange
    })
    size: number;

    @IsNotEmpty({
        message: messages.validators.shared.pageIndexShouldNotBeEmpty
    })
    @IsInt({ message: messages.validators.shared.pageIndexShouldBeInteger })
    @Min(0, {
        message: messages.validators.shared.pageIndexShouldBeCorrectRange
    })
    index: number;
}

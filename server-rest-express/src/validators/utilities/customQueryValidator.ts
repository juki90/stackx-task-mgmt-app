import { en as messages } from '@/locales';

export const validatePageSizeAndIndex = ({
    size,
    index
}: {
    size: unknown;
    index: unknown;
}) => {
    const isSizeNumber = typeof size === 'number';

    if (!size && !isSizeNumber) {
        throw new Error(messages.validators.shared.pageSizeShouldNotBeEmpty);
    }

    if (isNaN(parseInt(`${size}`))) {
        throw new Error(messages.validators.shared.pageSizeShouldBeInteger);
    }

    if (isSizeNumber && size < 1 && size > 50) {
        throw new Error(
            messages.validators.shared.pageSizeShouldBeCorrectRange
        );
    }

    const isIndexNumber = typeof index === 'number';

    if (!index && !isIndexNumber) {
        throw new Error(messages.validators.shared.pageIndexShouldNotBeEmpty);
    }

    if (isNaN(parseInt(`${index}`))) {
        throw new Error(messages.validators.shared.pageIndexShouldBeInteger);
    }

    if (isIndexNumber && index < 0) {
        throw new Error(
            messages.validators.shared.pageIndexShouldBeCorrectRange
        );
    }

    return true;
};

export const validateIndex = ({
    size,
    index
}: {
    size: unknown;
    index: unknown;
}) => {
    const isSizeNumber = typeof size === 'number';

    if (!size && !isSizeNumber) {
        throw new Error(messages.validators.shared.pageSizeShouldNotBeEmpty);
    }

    if (isNaN(parseInt(`${size}`))) {
        throw new Error(messages.validators.shared.pageSizeShouldBeInteger);
    }

    if (isSizeNumber && size < 1 && size > 50) {
        throw new Error(
            messages.validators.shared.pageSizeShouldBeCorrectRange
        );
    }

    const isIndexNumber = typeof index === 'number';

    if (!index && !isIndexNumber) {
        throw new Error(messages.validators.shared.pageIndexShouldNotBeEmpty);
    }

    if (isNaN(parseInt(`${index}`))) {
        throw new Error(messages.validators.shared.pageIndexShouldBeInteger);
    }

    if (isIndexNumber && index < 0) {
        throw new Error(
            messages.validators.shared.pageIndexShouldBeCorrectRange
        );
    }

    return true;
};

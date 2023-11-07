import {
    ValidationPipe,
    BadRequestException,
    type ValidationError
} from '@nestjs/common';

export default app => {
    app.useGlobalPipes(
        new ValidationPipe({
            skipUndefinedProperties: false,
            skipMissingProperties: false,
            skipNullProperties: false,
            disableErrorMessages: false,
            forbidUnknownValues: false,
            validationError: { target: true, value: false },
            dismissDefaultMessages: true,

            exceptionFactory(validationErrors: ValidationError[] = []) {
                const validationObjects = validationErrors.map(
                    ({ property, constraints }) => ({
                        field: property,
                        message: Object.values(constraints)[0]
                    })
                );

                return new BadRequestException(validationObjects);
            }
        })
    );
};

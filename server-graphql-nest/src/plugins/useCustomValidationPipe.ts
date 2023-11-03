import {
    ValidationPipe,
    BadRequestException,
    type ValidationError
} from '@nestjs/common';

export default app => {
    app.useGlobalPipes(
        new ValidationPipe({
            stopAtFirstError: false,
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
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

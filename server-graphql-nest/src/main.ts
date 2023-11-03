import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/appModule';
import useCustomValidationPipe from '@/plugins/useCustomValidationPipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    useCustomValidationPipe(app);

    await app.listen(3000);
}

bootstrap();

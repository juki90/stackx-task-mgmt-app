import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import useCors from '@/plugins/useCors';
import { AppModule } from '@/appModule';
import useCustomValidationPipe from '@/plugins/useCustomValidationPipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    useCors(app);
    useCustomValidationPipe(app);

    const port = +app.get(ConfigService).get<number>('NODE_PORT');

    await app.listen(port);
}

bootstrap();

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Test, type TestingModule } from '@nestjs/testing';

import { AppModule } from '@/appModule';
import clearDatabase from './helpers/clearDatabase';
import useCustomValidationPipe from '@/plugins/useCustomValidationPipe';

import type { INestApplication } from '@nestjs/common';

let app: INestApplication, dataSource: DataSource;

beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = app.get<DataSource>(DataSource);
    useCustomValidationPipe(app);
    await app.init();
    await clearDatabase();
});

afterAll(async () => {
    await dataSource.manager.connection.destroy();
    await app.close();
});

jest.setTimeout(30000);

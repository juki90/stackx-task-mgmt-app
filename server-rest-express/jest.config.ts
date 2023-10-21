import { pathsToModuleNameMapper } from 'ts-jest';

import * as tsConfig from './tsconfig.json';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./tests/setup.ts'],
    globalSetup: './tests/bootstrap.ts',
    moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
        prefix: '<rootDir>/src/'
    })
};

import { pathsToModuleNameMapper } from 'ts-jest';

import * as tsConfig from './tsconfig.json';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./test/setup.ts'],
    globalSetup: './test/bootstrap.ts',
    moduleNameMapper: pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
        prefix: '<rootDir>'
    }),
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
    }
};

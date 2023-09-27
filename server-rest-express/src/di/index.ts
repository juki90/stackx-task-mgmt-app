import path from 'path';
import { promises as fs } from 'fs';
import * as sequelizeTypescript from 'sequelize-typescript';
import { Container, ContainerModule } from 'inversify';

import type { PlatformFs, PlatformPath, SequelizeTypescript } from '@/types';

export default async () => {
    const container: Container = new Container({
        defaultScope: 'Singleton'
    });
    const coreModules = new ContainerModule(bind => {
        bind<PlatformFs>('%fs').toConstantValue(fs);
        bind<PlatformPath>('%path').toConstantValue(path);
    });
    const thirdPartyModules = new ContainerModule(bind => {
        bind<SequelizeTypescript>('%sequelize-typescript').toConstantValue(
            sequelizeTypescript
        );
    });

    container.load(coreModules, thirdPartyModules);

    const loadApplicationModules = async (currentDirectory = '') => {
        const currentLocation: string = path.join(__dirname, currentDirectory);
        const allFiles: string[] = await fs.readdir(currentLocation);
        const directories: string[] = allFiles.filter(
            file => !file.includes('.')
        );
        const files: string[] = allFiles.filter(file => file.includes('.'));

        for (const file of files) {
            const [fileName, fileExtension] = file.split('.');

            if (fileName === 'index' && !currentDirectory) {
                continue;
            }

            const pathToFileAndName: string = path.join(
                currentLocation,
                `${fileName}.${fileExtension}`
            );

            const { useConfig } = await import(pathToFileAndName);

            useConfig(container);
        }

        for (const directory of directories) {
            await loadApplicationModules(
                path.join(currentDirectory, directory)
            );
        }
    };

    await loadApplicationModules();

    // Preload of this dependency helps with getting repositories without async and solves issues with tests
    await container.getAsync('sequelize');

    return container;
};

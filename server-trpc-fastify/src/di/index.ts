import path from 'path';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import jsonwebtoken from 'jsonwebtoken';
import prisma from '~/plugins/prisma';
import { Container, ContainerModule } from 'inversify';

import type { Bcrypt, PlatformFs, PlatformPath, JsonWebToken } from '~/types';

export default async () => {
    const container: Container = new Container({
        defaultScope: 'Singleton'
    });
    const coreModules = new ContainerModule(bind => {
        bind<PlatformFs>('%fs').toConstantValue(fs);
        bind<Bcrypt>('%bcrypt').toConstantValue(bcrypt);
        bind<PlatformPath>('%path').toConstantValue(path);
        bind<JsonWebToken>('%jsonwebtoken').toConstantValue(jsonwebtoken);
    });

    const thirdPartyModules = new ContainerModule(bind => {
        bind<typeof prisma>('%prisma').toConstantValue(prisma);
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

    return container;
};

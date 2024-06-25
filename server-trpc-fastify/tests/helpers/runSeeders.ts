import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import initDi from '~/di';
import { ROLE } from '~/config/constants';

import type { IUserRepository, IRoleRepository } from '~/types';

export default async () => {
    const di = await initDi();
    const roleRepository = di.get<IRoleRepository>('repositories.role');
    const userRepository = di.get<IUserRepository>('repositories.user');
    const { NAMES: ROLE_NAMES } = ROLE;

    let [existingUserRole, existingAdminRole] = await Promise.all([
        roleRepository.findOne({ where: { name: ROLE_NAMES.USER } }),
        roleRepository.findOne({ where: { name: ROLE_NAMES.ADMIN } })
    ]);

    if (!existingAdminRole) {
        existingAdminRole = await roleRepository.create({
            data: {
                id: uuidv4(),
                name: ROLE_NAMES.ADMIN,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    }

    if (!existingUserRole) {
        existingUserRole = await roleRepository.create({
            data: {
                id: uuidv4(),
                name: ROLE_NAMES.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    }

    const adminUserId = uuidv4();
    const adminUser = await userRepository.create({
        data: {
            id: adminUserId,
            firstName: ROLE_NAMES.ADMIN,
            lastName: ROLE_NAMES.ADMIN,
            email: `admin.${adminUserId}@example.test`,
            password: bcrypt.hashSync('1234abcd', 12),
            createdAt: new Date(),
            updatedAt: new Date(),
            role: { connect: { id: existingAdminRole?.id } }
        }
    });

    const userId = uuidv4();
    const user = await userRepository.create({
        data: {
            id: userId,
            firstName: ROLE_NAMES.USER,
            lastName: ROLE_NAMES.USER,
            email: `user.${userId}@example.test`,
            password: bcrypt.hashSync('1234abcd', 12),
            createdAt: new Date(),
            updatedAt: new Date(),
            role: { connect: { id: existingUserRole?.id } },
            createdBy: { connect: { id: adminUser.id } }
        }
    });

    return {
        user,
        adminUser,
        adminRole: existingAdminRole,
        userRole: existingUserRole
    };
};

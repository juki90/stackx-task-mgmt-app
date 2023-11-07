import { User } from '@/entities/User';
import { Role, ROLE_NAMES } from '@/entities/Role';
import { DeepPartial } from 'typeorm';

export default async () => {
    const roleRepository = typeOrmManager.getRepository(Role);
    const userRepository = typeOrmManager.getRepository(User);

    const [adminRole, userRole] = await Promise.all([
        roleRepository.save(
            roleRepository.create({
                name: ROLE_NAMES.ADMIN
            })
        ),
        roleRepository.save(
            roleRepository.create({
                name: ROLE_NAMES.USER
            })
        )
    ]);

    const adminUser = await userRepository.save(
        userRepository.create({
            firstName: ROLE_NAMES.ADMIN,
            lastName: ROLE_NAMES.ADMIN,
            email: 'admin@example.test',
            password: '1234abcd',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: adminRole
        })
    );

    const [user, editableAdmin, editableUser] = await Promise.all([
        userRepository.save(
            userRepository.create({
                firstName: ROLE_NAMES.USER,
                lastName: ROLE_NAMES.USER,
                email: 'user@example.test',
                password: '1234abcd',
                createdAt: new Date(),
                updatedAt: new Date(),
                role: userRole,
                createdBy: adminUser
            } as DeepPartial<User>)
        ),
        userRepository.save(
            userRepository.create({
                firstName: 'editable',
                lastName: ROLE_NAMES.ADMIN,
                email: 'editable.admin@example.test',
                password: '1234abcd',
                createdAt: new Date(),
                updatedAt: new Date(),
                role: adminRole,
                createdBy: adminUser
            } as DeepPartial<User>)
        ),
        userRepository.save(
            userRepository.create({
                firstName: 'editable',
                lastName: ROLE_NAMES.USER,
                email: 'editable.user@example.test',
                password: '1234abcd',
                createdAt: new Date(),
                updatedAt: new Date(),
                role: userRole,
                createdBy: adminUser
            } as DeepPartial<User>)
        )
    ]);

    return {
        user,
        adminUser,
        editableAdmin,
        editableUser,
        adminRole,
        userRole
    };
};

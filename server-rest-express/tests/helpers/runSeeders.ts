import { ROLE_NAMES } from '@/models/Role';

export default async () => {
    const adminRole = await roleRepository.create({
        name: ROLE_NAMES.ADMIN
    });
    const userRole = await roleRepository.create({ name: ROLE_NAMES.USER });

    const adminUser = await userRepository.create({
        firstName: ROLE_NAMES.ADMIN,
        lastName: ROLE_NAMES.ADMIN,
        email: 'admin@example.test',
        password: '1234abcd'
    });

    await adminUser.setRole(adminRole);

    const user = await userRepository.create({
        firstName: ROLE_NAMES.USER,
        lastName: ROLE_NAMES.USER,
        email: 'user@example.test',
        password: '1234abcd'
    });

    await user.setRole(userRole);
    await user.setCreatedBy(adminUser);

    const editableAdmin = await userRepository.create({
        firstName: 'editable',
        lastName: 'admin',
        email: 'editable.admin@example.test',
        password: '1234abcd'
    });

    await editableAdmin.setRole(adminRole);
    await editableAdmin.setCreatedBy(adminUser);

    const editableUser = await userRepository.create({
        firstName: 'editable',
        lastName: 'user',
        email: 'editable.user@example.test',
        password: '1234abcd'
    });

    await editableUser.setRole(userRole);
    await editableUser.setCreatedBy(adminUser);

    return {
        user,
        adminUser,
        editableAdmin,
        editableUser,
        adminRole,
        userRole
    };
};

import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

import initDi from '~/di';
import { ROLE, USER } from '~/config/constants';

import type { User, IRoleRepository, IUserRepository } from '~/types';

class UserFactory {
    static generate(props: Partial<User & { isAdmin?: boolean }> = {}) {
        const defaultProps = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: '1234abcd',
            isAdmin: true
        };

        return {
            ...defaultProps,
            ...props
        };
    }

    static async create(props: Partial<User & { isAdmin?: boolean }> = {}) {
        const di = await initDi();
        const userRepository = di.get<IUserRepository>('repositories.user');
        const roleRepository = di.get<IRoleRepository>('repositories.role');

        const [adminRole, userRole] = await Promise.all([
            roleRepository.findOne({
                where: { name: ROLE.NAMES.ADMIN }
            }),
            roleRepository.findOne({
                where: { name: ROLE.NAMES.USER }
            })
        ]);

        const admin = await userRepository.findOne({
            where: { roleId: adminRole?.id, createdById: null }
        });
        const { isAdmin, ...generateProps } = this.generate(props);

        generateProps.password = bcrypt.hashSync(generateProps.password, 12);

        return userRepository.create({
            data: {
                ...generateProps,
                role: {
                    connect: { id: isAdmin ? adminRole?.id : userRole?.id }
                },
                createdBy: { connect: { id: admin?.id } }
            },
            select: { ...USER.SELECTABLE_FIELDS, role: true, createdBy: true }
        });
    }
}

export default UserFactory;

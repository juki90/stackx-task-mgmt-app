import { DeepPartial } from 'typeorm';
import { faker } from '@faker-js/faker';

import type { User } from '@/entities/User';
import { ROLE_NAMES } from '@/entities/Role';

class UserFactory {
    static generate(props: DeepPartial<User> & { isAdmin?: boolean } = {}) {
        const defaultProps = {
            firstName: faker.person.firstName(null),
            lastName: faker.person.lastName(null),
            email: faker.internet.email(),
            password: faker.internet.password(),
            isAdmin: true
        };

        return {
            ...defaultProps,
            ...props
        };
    }

    static async create(props: DeepPartial<User> & { isAdmin?: boolean } = {}) {
        const { isAdmin, ...generateProps } = props;

        const [adminRole, userRole] = await Promise.all([
            roleRepository.findOne({ where: { name: ROLE_NAMES.ADMIN } }),
            roleRepository.findOne({ where: { name: ROLE_NAMES.USER } })
        ]);

        const generatedProps = this.generate(generateProps);

        delete generatedProps.isAdmin;

        return userRepository.create({
            ...generatedProps,
            role: isAdmin ? adminRole : userRole
        });
    }
}

export default UserFactory;

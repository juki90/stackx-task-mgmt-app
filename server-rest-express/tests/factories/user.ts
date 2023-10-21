import { faker } from '@faker-js/faker';

import type { User } from '@/types';
import type { MakeNullishOptional } from 'sequelize/types/utils';

class UserFactory {
    static generate(
        props: MakeNullishOptional<User> & { isAdmin?: boolean } = {}
    ) {
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

    static async create(
        props: MakeNullishOptional<User> & { isAdmin?: boolean } = {}
    ) {
        const { isAdmin, ...generateProps } = props;
        const user = await userRepository.create(this.generate(generateProps));
        const userRole = await roleRepository.findOne({
            where: { name: ROLE_NAMES.USER }
        });
        const adminRole = await roleRepository.findOne({
            where: { name: ROLE_NAMES.ADMIN }
        });

        await user.setRole(isAdmin ? adminRole : userRole);

        return user;
    }
}

export default UserFactory;

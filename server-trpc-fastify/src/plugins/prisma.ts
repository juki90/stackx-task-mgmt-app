import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
    result: {
        user: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute({ firstName, lastName }) {
                    return `${firstName} ${lastName}`;
                }
            }
        }
    }
});

export default prisma;

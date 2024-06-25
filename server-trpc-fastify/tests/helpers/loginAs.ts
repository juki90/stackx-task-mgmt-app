import { preparePayload } from '~/helpers/payloadConverter';

import type { Fastify, FastifyInjectResponseWithOptionalJwt } from '~/types';

export default async (fastify: Fastify, email) => {
    const {
        headers: { 'x-auth-token': token }
    }: FastifyInjectResponseWithOptionalJwt = await fastify.inject({
        method: 'POST',
        url: '/trpc/auth.login',
        payload: preparePayload({
            email,
            password: '1234abcd'
        })
    });

    return { token };
};

import * as fastify from 'fastify';
import type {
    Server,
    ServerResponse,
    IncomingMessage,
    OutgoingHttpHeaders
} from 'http';

type Fastify = fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;
type FastifyInjectResponseWithOptionalJwt = {
    statusCode?: number;
    payload: string;
    headers: OutgoingHttpHeaders & { 'x-auth-token'?: string };
};

export { Fastify, FastifyInjectResponseWithOptionalJwt };

export * from '~/types/di';
export * from '~/types/models';
export * from '~/types/config';
export * from '~/types/services';
export * from '~/types/repositories';

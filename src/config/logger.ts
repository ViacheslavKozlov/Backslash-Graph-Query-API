import type { FastifyServerOptions } from 'fastify';

const isDev = process.env.NODE_ENV !== 'production';

export const loggerConfigDev: FastifyServerOptions['logger'] = isDev
  ? { transport: { target: 'pino-pretty' } }
  : true;

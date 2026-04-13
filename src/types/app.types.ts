import type { FastifyServerOptions } from 'fastify';

export interface BuildAppOptions {
  dataFilePath?: string;
  logger?: FastifyServerOptions['logger'];
}

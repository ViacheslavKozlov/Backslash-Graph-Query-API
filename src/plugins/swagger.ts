import type { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Backslash Graph Query API',
        version: '1.0.0',
        description: 'RESTful API for querying microservice route graphs with combinable filters',
      },
      tags: [
        { name: 'graph', description: 'Full graph operations' },
        { name: 'routes', description: 'Route query and filtering' },
        { name: 'health', description: 'Health check' },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });
}

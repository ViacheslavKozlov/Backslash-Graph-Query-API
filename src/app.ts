import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { loadGraph } from './graph/graph.loader.js';
import { GraphService } from './graph/graph.service.js';
import { FilterRegistry } from './filters/filter.registry.js';
import { PublicStartFilter } from './filters/public-start.filter.js';
import { SinkEndFilter } from './filters/sink-end.filter.js';
import { VulnerabilityFilter } from './filters/vulnerability.filter.js';
import { registerGraphRoutes } from './routes/graph.routes.js';
import { registerRoutesRoutes } from './routes/routes.routes.js';
import { errorHandler } from './errors/error-handler.js';
import { config } from './config/index.js';
import type { BuildAppOptions } from './types/app.types.js';

export async function buildApp(options: BuildAppOptions = {}) {
  const fastify = Fastify({
    logger: options.logger ?? true,
  });

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

  fastify.setErrorHandler(errorHandler);

  // Load graph
  const dataFilePath = options.dataFilePath ?? config.dataFilePath;
  const graph = loadGraph(dataFilePath);
  const graphService = new GraphService(graph);

  // Register filters
  const filterRegistry = new FilterRegistry();
  filterRegistry.register(new PublicStartFilter());
  filterRegistry.register(new SinkEndFilter());
  filterRegistry.register(new VulnerabilityFilter());

  // Register routes
  registerGraphRoutes(fastify, graphService);
  registerRoutesRoutes(fastify, graphService, filterRegistry);

  // Health check
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
  );

  await fastify.ready();

  return fastify;
}

import Fastify from 'fastify';
import { loadGraph } from './graph/graph.loader.js';
import { GraphService } from './graph/graph.service.js';
import { createFilterRegistry } from './filters/create-filter.registry.js';
import { registerSwagger } from './plugins/swagger.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './errors/error.handler.js';
import { config } from './config/index.js';
import type { BuildAppOptions } from './types/app.types.js';

export async function buildApp(options: BuildAppOptions = {}) {
  // Infrastructure
  const fastify = Fastify({
    logger: options.logger ?? true,
  });
  await registerSwagger(fastify);
  fastify.setErrorHandler(errorHandler);

  // Service layer
  const dataFilePath = options.dataFilePath ?? config.dataFilePath;
  const graph = loadGraph(dataFilePath);
  const graphService = new GraphService(graph);
  const filterRegistry = createFilterRegistry();

  // Controller layer
  registerRoutes(fastify, graphService, filterRegistry);

  await fastify.ready();
  return fastify;
}

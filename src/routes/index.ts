import type { FastifyInstance } from 'fastify';
import type { GraphService } from '../graph/graph.service.js';
import type { FilterRegistry } from '../filters/filter.registry.js';
import { registerGraphRoutes } from './graph.routes.js';
import { registerRoutesRoutes } from './route-query.routes.js';
import { registerHealthRoute } from './health.routes.js';

export function registerRoutes(
  fastify: FastifyInstance,
  graphService: GraphService,
  filterRegistry: FilterRegistry,
): void {
  registerHealthRoute(fastify);
  registerGraphRoutes(fastify, graphService);
  registerRoutesRoutes(fastify, graphService, filterRegistry);
}

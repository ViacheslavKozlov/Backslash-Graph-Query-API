import type { FastifyInstance } from 'fastify';
import type { GraphService } from '../graph/graph.service.js';
import type { FilterRegistry } from '../filters/filter.registry.js';
import { RouteQuerySchema, RoutesResponseSchema, type RouteQuery } from '../schemas/route-query.schema.js';
import { commonResponses } from '../schemas/common-responses.js';

export function registerRoutesRoutes(
  fastify: FastifyInstance,
  graphService: GraphService,
  filterRegistry: FilterRegistry,
) {
  fastify.get<{ Querystring: RouteQuery }>(
    '/api/v1/routes',
    {
      schema: {
        tags: ['routes'],
        summary: 'Get filtered routes',
        description:
          'Returns routes through the microservice graph, optionally filtered. Filters combine as AND (intersection).',
        querystring: RouteQuerySchema,
        response: {
          200: RoutesResponseSchema,
          ...commonResponses.errors,
        },
      },
    },
    async (request) => {
      const allRoutes = graphService.findAllRoutes();
      const graph = graphService.getGraph();

      const filterNames = request.query.filters
        ? request.query.filters
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean)
        : [];

      const filteredRoutes =
        filterNames.length > 0 ? filterRegistry.apply(filterNames, allRoutes, graph) : allRoutes;

      return {
        routes: filteredRoutes,
        metadata: {
          totalRoutes: allRoutes.length,
          filteredRoutes: filteredRoutes.length,
          appliedFilters: filterNames,
        },
      };
    },
  );
}

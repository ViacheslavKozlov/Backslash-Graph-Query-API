import type { FastifyInstance } from 'fastify';
import type { GraphService } from '../graph/graph.service.js';
import { GraphResponseSchema } from '../schemas/route-query.schema.js';
import { commonResponses } from '../schemas/common-responses.js';

export function registerGraphRoutes(fastify: FastifyInstance, graphService: GraphService) {
  fastify.get(
    '/api/v1/graph',
    {
      schema: {
        tags: ['graph'],
        summary: 'Get full graph',
        description: 'Returns all nodes and edges in the microservice graph',
        response: {
          200: GraphResponseSchema,
          ...commonResponses.error500,
        },
      },
    },
    async () => {
      const graph = graphService.getGraph();
      return {
        nodes: Array.from(graph.nodes.values()),
        edges: graph.edges,
      };
    },
  );
}

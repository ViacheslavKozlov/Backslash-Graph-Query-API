import { Type, type Static } from '@sinclair/typebox';

export const RouteQuerySchema = Type.Object({
  filters: Type.Optional(
    Type.String({
      description: 'Comma-separated filter names: publicStart, sinkEnd, vulnerability',
      examples: ['publicStart,sinkEnd'],
    }),
  ),
});

export type RouteQuery = Static<typeof RouteQuerySchema>;

const VulnerabilitySchema = Type.Object({
  file: Type.String(),
  severity: Type.String(),
  message: Type.String(),
  metadata: Type.Object({
    cwe: Type.String(),
  }),
});

const GraphNodeSchema = Type.Object({
  name: Type.String(),
  kind: Type.String(),
  language: Type.Optional(Type.String()),
  path: Type.Optional(Type.String()),
  publicExposed: Type.Optional(Type.Boolean()),
  vulnerabilities: Type.Optional(Type.Array(VulnerabilitySchema)),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});

const GraphEdgeSchema = Type.Object({
  from: Type.String(),
  to: Type.Array(Type.String()),
});

const RouteSchema = Type.Object({
  path: Type.Array(Type.String()),
  nodes: Type.Array(GraphNodeSchema),
  edges: Type.Array(GraphEdgeSchema),
});

export const RoutesResponseSchema = Type.Object({
  routes: Type.Array(RouteSchema),
  metadata: Type.Object({
    totalRoutes: Type.Number(),
    filteredRoutes: Type.Number(),
    appliedFilters: Type.Array(Type.String()),
  }),
});

export const GraphResponseSchema = Type.Object({
  nodes: Type.Array(GraphNodeSchema),
  edges: Type.Array(GraphEdgeSchema),
});

export const ErrorResponseSchema = Type.Object({
  statusCode: Type.Number(),
  code: Type.String(),
  message: Type.String(),
});

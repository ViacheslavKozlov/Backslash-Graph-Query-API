import type { GraphNode, GraphEdge } from './graph.types.js';

export interface Route {
  path: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RouteMetadata {
  totalRoutes: number;
  filteredRoutes: number;
  appliedFilters: string[];
}

export interface RoutesResponse {
  routes: Route[];
  metadata: RouteMetadata;
}

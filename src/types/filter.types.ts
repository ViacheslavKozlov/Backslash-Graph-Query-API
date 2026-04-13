import type { Route } from './route.types.js';
import type { Graph } from './graph.types.js';

export interface RouteFilter {
  readonly name: string;
  apply(routes: Route[], graph: Graph): Route[];
}

export type FilterName = 'publicStart' | 'sinkEnd' | 'vulnerability';

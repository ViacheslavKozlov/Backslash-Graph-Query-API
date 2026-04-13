import type { RouteFilter } from '../types/filter.types.js';
import type { Route } from '../types/route.types.js';
import type { Graph } from '../types/graph.types.js';

export class PublicStartFilter implements RouteFilter {
  readonly name = 'publicStart';

  apply(routes: Route[], graph: Graph): Route[] {
    return routes.filter((route) => {
      const firstNodeName = route.path[0];
      const firstNode = graph.nodes.get(firstNodeName);
      return firstNode?.publicExposed === true;
    });
  }
}

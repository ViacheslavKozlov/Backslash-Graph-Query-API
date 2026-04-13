import type { RouteFilter } from '../types/filter.types.js';
import type { Route } from '../types/route.types.js';
import type { Graph } from '../types/graph.types.js';

export class SinkEndFilter implements RouteFilter {
  readonly name = 'sinkEnd';

  apply(routes: Route[], graph: Graph): Route[] {
    return routes.filter((route) => {
      const lastNodeName = route.path[route.path.length - 1];
      const lastNode = graph.nodes.get(lastNodeName);
      return lastNode !== undefined && lastNode.kind !== 'service';
    });
  }
}

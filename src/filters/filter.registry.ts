import type { RouteFilter } from '../types/filter.types.js';
import type { Route } from '../types/route.types.js';
import type { Graph } from '../types/graph.types.js';
import { InvalidFilterError } from '../errors/app-error.js';

export class FilterRegistry {
  private readonly filters = new Map<string, RouteFilter>();

  register(filter: RouteFilter): void {
    this.filters.set(filter.name, filter);
  }

  getAvailableFilters(): string[] {
    return Array.from(this.filters.keys());
  }

  apply(filterNames: string[], routes: Route[], graph: Graph): Route[] {
    for (const name of filterNames) {
      if (!this.filters.has(name)) {
        throw new InvalidFilterError(name, this.getAvailableFilters());
      }
    }

    return filterNames.reduce<Route[]>((filtered, name) => {
      const filter = this.filters.get(name);
      if (!filter) {
        throw new InvalidFilterError(name, this.getAvailableFilters());
      }
      return filter.apply(filtered, graph);
    }, routes);
  }
}

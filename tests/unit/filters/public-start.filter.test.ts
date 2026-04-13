import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGraph } from '../../../src/graph/graph.loader.js';
import { GraphService } from '../../../src/graph/graph.service.js';
import { PublicStartFilter } from '../../../src/filters/public-start.filter.js';
import type { Graph } from '../../../src/types/graph.types.js';
import type { Route } from '../../../src/types/route.types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('PublicStartFilter', () => {
  let graph: Graph;
  let routes: Route[];
  const filter = new PublicStartFilter();

  beforeAll(() => {
    graph = loadGraph(path.resolve(__dirname, '../../fixtures/test-graph.json'));
    const service = new GraphService(graph);
    routes = service.findAllRoutes();
  });

  it('should have name "publicStart"', () => {
    expect(filter.name).toBe('publicStart');
  });

  it('should keep only routes starting from public nodes', () => {
    const filtered = filter.apply(routes, graph);

    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((route) => {
      const firstNode = graph.nodes.get(route.path[0]);
      expect(firstNode?.publicExposed).toBe(true);
    });
  });

  it('should filter out routes not starting from public nodes', () => {
    const filtered = filter.apply(routes, graph);
    const nonPublicRoutes = filtered.filter((route) => {
      const firstNode = graph.nodes.get(route.path[0]);
      return firstNode?.publicExposed !== true;
    });

    expect(nonPublicRoutes).toHaveLength(0);
  });
});

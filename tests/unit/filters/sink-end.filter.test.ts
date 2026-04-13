import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGraph } from '../../../src/graph/graph.loader.js';
import { GraphService } from '../../../src/graph/graph.service.js';
import { SinkEndFilter } from '../../../src/filters/sink-end.filter.js';
import type { Graph } from '../../../src/types/graph.types.js';
import type { Route } from '../../../src/types/route.types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('SinkEndFilter', () => {
  let graph: Graph;
  let routes: Route[];
  const filter = new SinkEndFilter();

  beforeAll(() => {
    graph = loadGraph(path.resolve(__dirname, '../../fixtures/test-graph.json'));
    const service = new GraphService(graph);
    routes = service.findAllRoutes();
  });

  it('should have name "sinkEnd"', () => {
    expect(filter.name).toBe('sinkEnd');
  });

  it('should keep only routes ending at non-service nodes', () => {
    const filtered = filter.apply(routes, graph);

    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((route) => {
      const lastNode = graph.nodes.get(route.path[route.path.length - 1]);
      expect(lastNode?.kind).not.toBe('service');
    });
  });

  it('should include routes ending at rds and sqs sinks', () => {
    const filtered = filter.apply(routes, graph);
    const lastNodes = filtered.map((r) => r.path[r.path.length - 1]);

    expect(lastNodes).toContain('db-sink');
    expect(lastNodes).toContain('queue-sink');
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGraph } from '../../src/graph/graph.loader.js';
import { GraphService } from '../../src/graph/graph.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.resolve(__dirname, '../fixtures');

describe('GraphService', () => {
  let service: GraphService;

  beforeAll(() => {
    const graph = loadGraph(path.join(fixturesPath, 'test-graph.json'));
    service = new GraphService(graph);
  });

  it('should return all nodes', () => {
    const nodes = service.getNodes();
    expect(nodes).toHaveLength(6);
  });

  it('should return all edges', () => {
    const edges = service.getEdges();
    expect(edges).toHaveLength(3);
  });

  it('should find all routes via DFS', () => {
    const routes = service.findAllRoutes();

    expect(routes.length).toBeGreaterThan(0);

    const paths = routes.map((r) => r.path);

    expect(paths).toContainEqual(['public-api', 'internal-service', 'db-sink']);
    expect(paths).toContainEqual(['public-api', 'another-service', 'queue-sink']);
  });

  it('should include full node objects in routes', () => {
    const routes = service.findAllRoutes();
    const route = routes.find(
      (r) => r.path[0] === 'public-api' && r.path.includes('internal-service'),
    );

    expect(route).toBeDefined();
    expect(route!.nodes[0].name).toBe('public-api');
    expect(route!.nodes[0].publicExposed).toBe(true);
  });

  it('should include edges connecting route nodes', () => {
    const routes = service.findAllRoutes();
    const route = routes.find(
      (r) =>
        JSON.stringify(r.path) === JSON.stringify(['public-api', 'internal-service', 'db-sink']),
    );

    expect(route).toBeDefined();
    expect(route!.edges).toHaveLength(2);
    expect(route!.edges[0].from).toBe('public-api');
    expect(route!.edges[0].to).toEqual(['internal-service']);
  });

  it('should not include orphan nodes in routes', () => {
    const routes = service.findAllRoutes();
    const orphanInRoute = routes.some((r) => r.path.includes('orphan-service'));
    expect(orphanInRoute).toBe(false);
  });
});

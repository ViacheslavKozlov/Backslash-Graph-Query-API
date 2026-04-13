import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGraph } from '../../src/graph/graph.loader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.resolve(__dirname, '../fixtures');

describe('graph.loader', () => {
  it('should load and parse valid graph JSON', () => {
    const graph = loadGraph(path.join(fixturesPath, 'test-graph.json'));

    expect(graph.nodes.size).toBe(6);
    expect(graph.edges).toHaveLength(3);
    expect(graph.nodes.get('public-api')?.publicExposed).toBe(true);
  });

  it('should normalize string "to" field to array', () => {
    const graph = loadGraph(path.join(fixturesPath, 'test-graph.json'));
    const anotherEdge = graph.edges.find((e) => e.from === 'another-service');

    expect(anotherEdge?.to).toEqual(['queue-sink']);
  });

  it('should create placeholder nodes for missing edge references', () => {
    const graph = loadGraph(path.resolve(__dirname, '../../data/train-ticket-be.json'));

    expect(graph.nodes.has('assurance-service')).toBe(true);
    expect(graph.nodes.get('assurance-service')?.kind).toBe('service');
  });

  it('should throw GraphLoadError for missing file', () => {
    expect(() => loadGraph('/nonexistent/file.json')).toThrow('Failed to load graph');
  });

  it('should throw GraphLoadError for invalid JSON structure', async () => {
    const tmpPath = path.join(fixturesPath, 'invalid.json');
    const fs = await import('node:fs');
    fs.writeFileSync(tmpPath, JSON.stringify({ foo: 'bar' }));

    try {
      expect(() => loadGraph(tmpPath)).toThrow('missing nodes or edges');
    } finally {
      fs.unlinkSync(tmpPath);
    }
  });
});

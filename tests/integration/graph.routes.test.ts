import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDataPath = path.resolve(__dirname, '../fixtures/test-graph.json');

describe('GET /api/v1/graph', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ dataFilePath: testDataPath, logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with nodes and edges', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/graph',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.nodes).toBeDefined();
    expect(body.edges).toBeDefined();
    expect(body.nodes).toHaveLength(6);
    expect(body.edges).toHaveLength(3);
  });

  it('should include node details in response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/graph',
    });

    const body = response.json();
    const publicNode = body.nodes.find((n: { name: string }) => n.name === 'public-api');
    expect(publicNode).toBeDefined();
    expect(publicNode.publicExposed).toBe(true);
    expect(publicNode.kind).toBe('service');
  });
});

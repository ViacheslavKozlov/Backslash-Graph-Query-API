import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDataPath = path.resolve(__dirname, '../fixtures/test-graph.json');

describe('GET /api/v1/routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ dataFilePath: testDataPath, logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return all routes when no filters applied', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.routes.length).toBeGreaterThan(0);
    expect(body.metadata.appliedFilters).toEqual([]);
    expect(body.metadata.totalRoutes).toBe(body.metadata.filteredRoutes);
  });

  it('should filter by publicStart', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes?filters=publicStart',
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.metadata.appliedFilters).toEqual(['publicStart']);

    body.routes.forEach((route: { path: string[] }) => {
      expect(route.path[0]).toBe('public-api');
    });
  });

  it('should filter by sinkEnd', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes?filters=sinkEnd',
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.metadata.appliedFilters).toEqual(['sinkEnd']);
    expect(body.metadata.filteredRoutes).toBeGreaterThan(0);
  });

  it('should filter by vulnerability', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes?filters=vulnerability',
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.metadata.appliedFilters).toEqual(['vulnerability']);
  });

  it('should combine filters with AND logic', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes?filters=publicStart,sinkEnd',
    });

    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.metadata.appliedFilters).toEqual(['publicStart', 'sinkEnd']);

    body.routes.forEach((route: { path: string[] }) => {
      expect(route.path[0]).toBe('public-api');
    });
  });

  it('should return 400 for invalid filter name', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes?filters=invalidFilter',
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.code).toBe('INVALID_FILTER');
    expect(body.message).toContain('invalidFilter');
    expect(body.message).toContain('Available');
  });

  it('should include route metadata', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/routes?filters=publicStart',
    });

    const body = response.json();
    expect(body.metadata).toBeDefined();
    expect(typeof body.metadata.totalRoutes).toBe('number');
    expect(typeof body.metadata.filteredRoutes).toBe('number');
    expect(body.metadata.filteredRoutes).toBeLessThanOrEqual(body.metadata.totalRoutes);
  });
});

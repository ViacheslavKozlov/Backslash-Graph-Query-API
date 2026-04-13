# Backslash Graph Query API

RESTful API for querying microservice route graphs with combinable filters. Built with TypeScript, Fastify 5, and a strategy-pattern filter system.

## Quick Start

```bash
npm install
npm run dev      # Development with hot reload + pretty logs
npm run build    # Compile TypeScript
npm start        # Production (run after build)
npm test         # Run all tests
```

Server starts at `http://localhost:3000`  
Swagger docs at `http://localhost:3000/docs`

## API Endpoints

### `GET /health`
Health check.

### `GET /api/v1/graph`
Returns the full graph (all nodes and edges).

### `GET /api/v1/routes?filters=publicStart,sinkEnd,vulnerability`
Returns routes through the microservice graph, optionally filtered.

| Param | Type | Description |
|---|---|---|
| `filters` | `string` (optional) | Comma-separated filter names |

**Available filters:**
- **`publicStart`** — Routes starting from a public service (`publicExposed: true`)
- **`sinkEnd`** — Routes ending at a sink (non-service infrastructure: rds, sqs)
- **`vulnerability`** — Routes passing through a node with vulnerabilities

Filters combine as **AND** — all specified filters must pass for a route to be included.

**Response:**
```json
{
  "routes": [
    {
      "path": ["frontend", "admin-basic-info-service", "station-service"],
      "nodes": [/* full node objects */],
      "edges": [/* edges connecting these nodes */]
    }
  ],
  "metadata": {
    "totalRoutes": 299,
    "filteredRoutes": 5,
    "appliedFilters": ["publicStart"]
  }
}
```

**Error response (invalid filter):**
```json
{
  "statusCode": 400,
  "code": "INVALID_FILTER",
  "message": "Unknown filter: 'foo'. Available: publicStart, sinkEnd, vulnerability"
}
```

## Architecture

```
src/
├── app.ts                    # Fastify app factory (testable)
├── server.ts                 # Entry point
├── types/                    # Domain types & interfaces
├── config/                   # Environment config
├── graph/
│   ├── graph.loader.ts       # JSON → typed Graph (normalizes edges, handles missing nodes)
│   └── graph.service.ts      # DFS route traversal, adjacency list
├── filters/
│   ├── filter.registry.ts    # Strategy registry (Open/Closed principle)
│   ├── public-start.filter.ts
│   ├── sink-end.filter.ts
│   └── vulnerability.filter.ts
├── routes/                   # Fastify route handlers
├── errors/                   # Custom errors + global handler
└── schemas/                  # Typebox schemas (validation + Swagger)
```

## Design Decisions

### Filter System (Strategy + Registry Pattern)
Each filter implements the `RouteFilter` interface and is registered in `FilterRegistry`. Adding a new filter requires only:
1. Create a new file implementing `RouteFilter`
2. Register it in `app.ts`


### Graph Loading
- **Edge normalization**: The `consign-service` edge has `to` as a string instead of array — loader normalizes all edges to `to: string[]`
- **Missing node tolerance**: `assurance-service` is referenced in edges but missing from `nodes[]` — loader creates a placeholder node with `kind: 'service'` and logs a warning
- **In-memory singleton**: JSON is small (~14KB), loaded once at startup synchronously. If the data source becomes async (e.g., database, remote API), the loader can be swapped to an async variant — route handlers are already `async` to support this transition without refactoring

### Route Discovery
- DFS traversal from all nodes with outgoing edges
- Cycle detection via visited set
- Routes include full node objects and connecting edges for easy client-side rendering

### Sink Definition
Sink = `kind !== 'service'` (generic). The PDF task mentions "rds/sql", but JSON also has SQS (message queue). Generalizing to any non-service infrastructure node covers both and future types.

### Filter Combination
Filters combine as **AND** (intersection). A route must pass ALL specified filters to be included. This was chosen because it's the most useful for narrowing down security-critical paths (e.g., "show me routes that start public AND end at a database AND pass through vulnerable services").

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Fastify 5 |
| Language | TypeScript (strict) |
| Validation | `@sinclair/typebox` |
| Testing | Vitest |
| API Docs | Swagger (`@fastify/swagger` + `@fastify/swagger-ui`) |
| Logging | Pino (built into Fastify) + `pino-pretty` (dev transport) |
| Dev Server | `tsx watch` with hot reload on file changes |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```


## Postman Collection

A pre-built Postman collection with test scripts is located at `docs/backslash-api.postman_collection.json`.

**Import into Postman:**
1. Open Postman → click **Import**
2. Select `docs/backslash-api.postman_collection.json`
3. The collection appears with 3 folders: **Health**, **Graph**, **Routes** (9 requests total)

**Run requests:**
- Ensure of running application
- Open any request and click **Send**, or
- Use the **Collection Runner** to execute all requests at once

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Protected — requires PR + CI pass |
| `dev` | Integration branch. All feature work merges here first |
| `feature/<name>` | New features (`feature/add-cache-layer`) |
| `refactor/<name>` | Code improvements (`refactor/extract-graph-loader`) |
| `fix/<name>` | Bug fixes (`fix/filter-edge-case`) |
| `hotfix/<name>` | Urgent production fixes — can merge directly to `main` |

**Flow:**
- `feature/*`, `refactor/*`, `fix/*` → PR to `dev` → PR to `main`
- `hotfix/*` → PR directly to `main` (bypasses `dev` for urgency)

## Data Overview

The provided `train-ticket-be.json` contains:
- **43+ nodes**: 41 services + 1 RDS (`prod-postgresdb`) + 1 SQS (`prod-sqs`) + 1 placeholder (`assurance-service`)
- **2 public services**: `frontend`, `gateway-service`
- **2 sinks**: `prod-postgresdb` (rds), `prod-sqs` (sqs)
- **3 vulnerabilities** across 2 services: `auth-service` (1 medium), `order-service` (1 high, 1 medium)

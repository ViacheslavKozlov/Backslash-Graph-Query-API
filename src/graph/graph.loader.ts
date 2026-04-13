import { readFileSync } from 'node:fs';
import type { Graph, GraphEdge, GraphNode, RawGraph } from '../types/graph.types.js';
import { GraphLoadError } from '../errors/app-error.js';

export function loadGraph(filePath: string): Graph {
  let rawData: RawGraph;

  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    rawData = JSON.parse(fileContent) as RawGraph;
  } catch (err) {
    throw new GraphLoadError(
      `Failed to load graph from ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!rawData.nodes || !rawData.edges) {
    throw new GraphLoadError('Invalid graph data: missing nodes or edges');
  }

  const nodes = new Map<string, GraphNode>();
  for (const node of rawData.nodes) {
    nodes.set(node.name, node);
  }

  const edges: GraphEdge[] = rawData.edges.map((edge) => ({
    from: edge.from,
    to: Array.isArray(edge.to) ? edge.to : [edge.to],
  }));

  // Handle missing nodes referenced in edges — create placeholders
  for (const edge of edges) {
    if (!nodes.has(edge.from)) {
      console.warn(`[graph.loader] Missing source node "${edge.from}", creating placeholder`);
      nodes.set(edge.from, { name: edge.from, kind: 'service' });
    }
    for (const target of edge.to) {
      if (!nodes.has(target)) {
        console.warn(`[graph.loader] Missing target node "${target}", creating placeholder`);
        nodes.set(target, { name: target, kind: 'service' });
      }
    }
  }

  return { nodes, edges };
}

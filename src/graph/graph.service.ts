import type { Graph, GraphEdge, GraphNode } from '../types/graph.types.js';
import type { Route } from '../types/route.types.js';

export class GraphService {
  private readonly adjacencyList: Map<string, string[]>;

  constructor(private readonly graph: Graph) {
    this.adjacencyList = this.buildAdjacencyList();
  }

  getGraph(): Graph {
    return this.graph;
  }

  getNodes(): GraphNode[] {
    return Array.from(this.graph.nodes.values());
  }

  getEdges(): GraphEdge[] {
    return this.graph.edges;
  }

  findAllRoutes(): Route[] {
    const routes: Route[] = [];
    const targetNodes = this.getNodesWithOutgoingEdges();

    for (const startNode of targetNodes) {
      this.dfs(startNode, [startNode], new Set([startNode]), routes);
    }

    return routes;
  }

  private buildAdjacencyList(): Map<string, string[]> {
    const adj = new Map<string, string[]>();

    for (const edge of this.graph.edges) {
      const existing = adj.get(edge.from) || [];
      adj.set(edge.from, [...existing, ...edge.to]);
    }

    return adj;
  }

  private getNodesWithOutgoingEdges(): string[] {
    const nodesWithEdges = new Set<string>();
    for (const edge of this.graph.edges) {
      nodesWithEdges.add(edge.from);
    }
    return Array.from(nodesWithEdges);
  }

  private dfs(current: string, path: string[], visited: Set<string>, routes: Route[]): void {
    const neighbors = this.adjacencyList.get(current) || [];

    if (neighbors.length === 0 || neighbors.every((n) => visited.has(n))) {
      if (path.length > 1) {
        routes.push(this.buildRoute(path));
      }
      return;
    }

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      visited.add(neighbor);
      path.push(neighbor);

      this.dfs(neighbor, path, visited, routes);

      path.pop();
      visited.delete(neighbor);
    }
  }

  private buildRoute(path: string[]): Route {
    const nodes: GraphNode[] = path
      .map((name) => this.graph.nodes.get(name))
      .filter((n): n is GraphNode => n !== undefined);

    const edges: GraphEdge[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      const edge = this.graph.edges.find((e) => e.from === from && e.to.includes(to));
      if (edge) {
        edges.push({ from, to: [to] });
      }
    }

    return { path: [...path], nodes, edges };
  }
}

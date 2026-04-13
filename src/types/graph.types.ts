export type NodeKind = 'service' | 'rds' | 'sqs';

export interface Vulnerability {
  file: string;
  severity: string;
  message: string;
  metadata: {
    cwe: string;
  };
}

export interface GraphNode {
  name: string;
  kind: NodeKind;
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities?: Vulnerability[];
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string[];
}

export interface RawGraphEdge {
  from: string;
  to: string | string[];
}

export interface RawGraph {
  nodes?: GraphNode[];
  edges?: RawGraphEdge[];
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

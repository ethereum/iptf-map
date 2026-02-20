export type NodeType = 'pattern' | 'use-case' | 'approach' | 'domain' | 'jurisdiction' | 'vendor';
export type EdgeType = 'see-also' | 'uses-pattern' | 'implements' | 'recommends' | 'in-domain' | 'regulated-by';

export interface GraphNode {
  id: string;
  type: NodeType;
  title: string;
  slug: string;
  file: string;
  layer?: string;
  maturity?: string;
  status?: string;
  privacy_goal?: string;
  primary_domain?: string;
  region?: string;
  summary: string;
  content: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    generated_at: string;
    node_count: number;
    edge_count: number;
  };
}

// D3 simulation node (extends GraphNode with x, y, etc.)
export interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SimEdge {
  source: SimNode;
  target: SimNode;
  type: EdgeType;
}

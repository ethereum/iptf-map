import type { NodeType, GraphNode } from './graph-types';

// ---------------------------------------------------------------------------
// Visual encoding constants
// ---------------------------------------------------------------------------

export const NODE_COLORS: Record<string, string> = {
  // Pattern layer colors
  L1: '#3B82F6',
  L2: '#8B5CF6',
  offchain: '#10B981',
  hybrid: '#06B6D4',
  // Node type colors (non-patterns)
  'use-case': '#F59E0B',
  approach: '#EAB308',
  domain: '#6B7280',
  jurisdiction: '#EF4444',
  vendor: '#14B8A6',
};

export const EDGE_COLORS: Record<string, string> = {
  'see-also': '#9CA3AF',
  'uses-pattern': '#EAB308',
  implements: '#14B8A6',
  recommends: '#F59E0B',
  'in-domain': '#D1D5DB',
  'regulated-by': '#EF4444',
};

const MATURITY_RADIUS: Record<string, number> = {
  experimental: 6,
  PoC: 10,
  pilot: 16,
  prod: 22,
  production: 22,
};

const TYPE_RADIUS: Record<NodeType, number> = {
  pattern: 10,       // overridden by maturity
  'use-case': 14,
  approach: 14,
  domain: 40,
  jurisdiction: 10,
  vendor: 12,
};

// Domain cluster positions (normalized 0-1, mapped to viewport later)
export const DOMAIN_ANCHORS: Record<string, { x: number; y: number }> = {
  payments: { x: 0.17, y: 0.25 },
  trading: { x: 0.5, y: 0.25 },
  custody: { x: 0.83, y: 0.25 },
  'funds-assets': { x: 0.17, y: 0.75 },
  'Funds & Assets': { x: 0.17, y: 0.75 },
  'identity-compliance': { x: 0.5, y: 0.75 },
  'Identity & Compliance': { x: 0.5, y: 0.75 },
  'data-oracles': { x: 0.83, y: 0.75 },
  'Data & Oracles': { x: 0.83, y: 0.75 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getNodeRadius(node: GraphNode): number {
  if (node.type === 'pattern' && node.maturity) {
    return MATURITY_RADIUS[node.maturity] ?? MATURITY_RADIUS.PoC;
  }
  return TYPE_RADIUS[node.type] ?? 10;
}

export function getNodeColor(node: GraphNode): string {
  if (node.type === 'pattern') {
    return NODE_COLORS[node.layer ?? 'hybrid'] ?? NODE_COLORS.hybrid;
  }
  return NODE_COLORS[node.type] ?? '#6B7280';
}

export function getNodeOpacity(node: GraphNode): number {
  return node.status === 'draft' ? 0.6 : 1.0;
}

export function getEdgeColor(type: string): string {
  return EDGE_COLORS[type] ?? '#D1D5DB';
}

/** Y-offset for layer stratification (negative = up) */
export function getLayerYOffset(layer?: string): number {
  switch (layer) {
    case 'L1': return 40;
    case 'L2': return 0;
    case 'offchain': return -40;
    case 'hybrid': return 20;
    default: return 0;
  }
}

/** Find the domain anchor closest to a node based on its primary_domain or edges. */
export function getDomainAnchor(
  node: GraphNode,
  domainEdges: Map<string, string[]>,
  width: number,
  height: number,
): { x: number; y: number } | null {
  // Domain nodes use their own slug
  if (node.type === 'domain') {
    const anchor = DOMAIN_ANCHORS[node.slug] ?? DOMAIN_ANCHORS[node.title];
    if (anchor) return { x: anchor.x * width, y: anchor.y * height };
  }

  // Use primary_domain from frontmatter
  if (node.primary_domain) {
    for (const [key, pos] of Object.entries(DOMAIN_ANCHORS)) {
      if (node.primary_domain.toLowerCase().includes(key.replace(/-/g, ' ').toLowerCase()) ||
          key.toLowerCase().includes(node.primary_domain.toLowerCase())) {
        return { x: pos.x * width, y: pos.y * height };
      }
    }
  }

  // Use domain edges
  const domains = domainEdges.get(node.id);
  if (domains && domains.length > 0) {
    // Average position of all connected domains
    let sx = 0, sy = 0, count = 0;
    for (const domainSlug of domains) {
      const anchor = DOMAIN_ANCHORS[domainSlug];
      if (anchor) {
        sx += anchor.x * width;
        sy += anchor.y * height;
        count++;
      }
    }
    if (count > 0) return { x: sx / count, y: sy / count };
  }

  return null;
}

/** Check if a node matches the current filters */
export function nodeMatchesFilters(
  node: GraphNode,
  filters: {
    domain?: string;
    layer?: string;
    maturity?: string;
    type?: string;
    search?: string;
  },
): boolean {
  if (filters.type && node.type !== filters.type) return false;
  if (filters.layer && node.type === 'pattern' && node.layer !== filters.layer) return false;
  if (filters.maturity && node.type === 'pattern' && node.maturity !== filters.maturity) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = `${node.title} ${node.summary} ${node.privacy_goal ?? ''}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

// Type labels for display
export const TYPE_LABELS: Record<NodeType, string> = {
  pattern: 'Pattern',
  'use-case': 'Use Case',
  approach: 'Approach',
  domain: 'Domain',
  jurisdiction: 'Jurisdiction',
  vendor: 'Vendor',
};

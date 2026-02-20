import { describe, it, expect } from 'vitest';
import {
  getNodeRadius,
  getNodeColor,
  getNodeOpacity,
  getEdgeColor,
  getLayerYOffset,
  nodeMatchesFilters,
  NODE_COLORS,
} from '../src/lib/graph-layout';
import type { GraphNode } from '../src/lib/graph-types';

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'pattern/test',
    type: 'pattern',
    title: 'Test Pattern',
    slug: 'test',
    file: 'patterns/pattern-test.md',
    summary: 'A test pattern',
    content: '## Intent\n\nTest',
    ...overrides,
  };
}

describe('getNodeRadius', () => {
  it('returns maturity-based radius for patterns', () => {
    expect(getNodeRadius(makeNode({ maturity: 'PoC' }))).toBe(10);
    expect(getNodeRadius(makeNode({ maturity: 'pilot' }))).toBe(16);
    expect(getNodeRadius(makeNode({ maturity: 'prod' }))).toBe(22);
    expect(getNodeRadius(makeNode({ maturity: 'experimental' }))).toBe(6);
  });

  it('returns fixed radius for non-pattern types', () => {
    expect(getNodeRadius(makeNode({ type: 'use-case' }))).toBe(14);
    expect(getNodeRadius(makeNode({ type: 'domain' }))).toBe(40);
    expect(getNodeRadius(makeNode({ type: 'vendor' }))).toBe(12);
    expect(getNodeRadius(makeNode({ type: 'jurisdiction' }))).toBe(10);
  });
});

describe('getNodeColor', () => {
  it('returns layer-based color for patterns', () => {
    expect(getNodeColor(makeNode({ layer: 'L1' }))).toBe('#3B82F6');
    expect(getNodeColor(makeNode({ layer: 'L2' }))).toBe('#8B5CF6');
    expect(getNodeColor(makeNode({ layer: 'offchain' }))).toBe('#10B981');
    expect(getNodeColor(makeNode({ layer: 'hybrid' }))).toBe('#06B6D4');
  });

  it('returns type-based color for non-patterns', () => {
    expect(getNodeColor(makeNode({ type: 'use-case' }))).toBe(NODE_COLORS['use-case']);
    expect(getNodeColor(makeNode({ type: 'vendor' }))).toBe(NODE_COLORS.vendor);
  });
});

describe('getNodeOpacity', () => {
  it('returns 0.6 for draft', () => {
    expect(getNodeOpacity(makeNode({ status: 'draft' }))).toBe(0.6);
  });
  it('returns 1.0 for ready', () => {
    expect(getNodeOpacity(makeNode({ status: 'ready' }))).toBe(1.0);
  });
});

describe('getEdgeColor', () => {
  it('returns correct colors for edge types', () => {
    expect(getEdgeColor('see-also')).toBe('#9CA3AF');
    expect(getEdgeColor('implements')).toBe('#14B8A6');
    expect(getEdgeColor('recommends')).toBe('#F59E0B');
  });
});

describe('getLayerYOffset', () => {
  it('L1 goes down, offchain goes up', () => {
    expect(getLayerYOffset('L1')).toBeGreaterThan(0);
    expect(getLayerYOffset('offchain')).toBeLessThan(0);
    expect(getLayerYOffset('L2')).toBe(0);
  });
});

describe('nodeMatchesFilters', () => {
  const node = makeNode({
    type: 'pattern',
    layer: 'L2',
    maturity: 'PoC',
    title: 'ZK Shielded Balances',
    summary: 'Confidential balances',
  });

  it('matches with no filters', () => {
    expect(nodeMatchesFilters(node, {})).toBe(true);
  });

  it('filters by type', () => {
    expect(nodeMatchesFilters(node, { type: 'pattern' })).toBe(true);
    expect(nodeMatchesFilters(node, { type: 'vendor' })).toBe(false);
  });

  it('filters by layer', () => {
    expect(nodeMatchesFilters(node, { layer: 'L2' })).toBe(true);
    expect(nodeMatchesFilters(node, { layer: 'L1' })).toBe(false);
  });

  it('filters by search text', () => {
    expect(nodeMatchesFilters(node, { search: 'shielded' })).toBe(true);
    expect(nodeMatchesFilters(node, { search: 'xyz' })).toBe(false);
  });

  it('combines filters (AND)', () => {
    expect(nodeMatchesFilters(node, { type: 'pattern', layer: 'L2' })).toBe(true);
    expect(nodeMatchesFilters(node, { type: 'pattern', layer: 'L1' })).toBe(false);
  });
});

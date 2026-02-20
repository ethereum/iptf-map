import { describe, it, expect } from 'vitest';
import {
  parseFrontmatter,
  fileToSlug,
  fileToNodeId,
  extractSummary,
  extractLinks,
  classifyEdge,
  buildGraph,
} from '../scripts/build-graph.mjs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// parseFrontmatter
// ---------------------------------------------------------------------------

describe('parseFrontmatter', () => {
  it('parses key-value pairs', () => {
    const { data, body } = parseFrontmatter(`---
title: "Pattern: ZK Shielded Balances"
status: draft
maturity: PoC
layer: L2
---

## Intent

Some content here.`);

    expect(data.title).toBe('Pattern: ZK Shielded Balances');
    expect(data.status).toBe('draft');
    expect(data.maturity).toBe('PoC');
    expect(data.layer).toBe('L2');
    expect(body).toContain('## Intent');
  });

  it('parses array fields', () => {
    const { data } = parseFrontmatter(`---
title: Test
dependencies:
  - ERC-6123
  - ERC-7573
---

Body`);

    expect(data.dependencies).toEqual(['ERC-6123', 'ERC-7573']);
  });

  it('handles missing frontmatter', () => {
    const { data, body } = parseFrontmatter('# Just a heading\n\nSome text.');
    expect(data).toEqual({});
    expect(body).toContain('Just a heading');
  });

  it('strips quotes from values', () => {
    const { data } = parseFrontmatter(`---
title: "Vendor: Aztec"
---
`);
    expect(data.title).toBe('Vendor: Aztec');
  });
});

// ---------------------------------------------------------------------------
// fileToSlug / fileToNodeId
// ---------------------------------------------------------------------------

describe('fileToSlug', () => {
  it('strips pattern- prefix and .md', () => {
    expect(fileToSlug('pattern-zk-shielded-balances.md', 'pattern-'))
      .toBe('zk-shielded-balances');
  });

  it('strips approach- prefix', () => {
    expect(fileToSlug('approach-private-bonds.md', 'approach-'))
      .toBe('private-bonds');
  });

  it('handles no prefix', () => {
    expect(fileToSlug('private-bonds.md', ''))
      .toBe('private-bonds');
  });
});

describe('fileToNodeId', () => {
  it('creates correct pattern ID', () => {
    expect(fileToNodeId('pattern', 'pattern-shielding.md', 'pattern-'))
      .toBe('pattern/shielding');
  });

  it('creates correct vendor ID', () => {
    expect(fileToNodeId('vendor', 'aztec.md', ''))
      .toBe('vendor/aztec');
  });
});

// ---------------------------------------------------------------------------
// extractSummary
// ---------------------------------------------------------------------------

describe('extractSummary', () => {
  it('extracts from ## Intent section', () => {
    const body = `## Intent

Maintain **confidential balances** inside a shielded pool.

## Ingredients`;

    expect(extractSummary(body)).toContain('confidential balances');
  });

  it('extracts from ## What it is (vendors)', () => {
    const body = `## What it is

Aztec is a privacy focused rollup.

## Architecture`;

    expect(extractSummary(body)).toContain('Aztec');
  });

  it('extracts from ## TLDR (domains)', () => {
    const body = `## TLDR
- Institutional cash movement: payouts, PvP, DvP.

## Primary use cases`;

    expect(extractSummary(body)).toContain('Institutional cash movement');
  });

  it('extracts from ## 1) Use Case', () => {
    const body = `## 1) Use Case

Bond issuance and trading on public blockchains.

## 2) Context`;

    expect(extractSummary(body)).toContain('Bond issuance');
  });

  it('truncates long summaries', () => {
    const longText = 'A'.repeat(300);
    const body = `## Intent\n\n${longText}\n\n## Next`;
    const summary = extractSummary(body, 200);
    expect(summary.length).toBeLessThanOrEqual(203); // 200 + "..."
    expect(summary.endsWith('...')).toBe(true);
  });

  it('returns empty string for empty body', () => {
    expect(extractSummary('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// extractLinks
// ---------------------------------------------------------------------------

describe('extractLinks', () => {
  it('extracts links with sections', () => {
    const body = `## See also

- [pattern-shielding.md](pattern-shielding.md)
- [pattern-l1-zk.md](../patterns/pattern-l1-zk-commitment-pool.md)`;

    const links = extractLinks(body);
    expect(links).toHaveLength(2);
    expect(links[0].href).toBe('pattern-shielding.md');
    expect(links[0].section).toBe('See also');
    expect(links[1].href).toBe('../patterns/pattern-l1-zk-commitment-pool.md');
  });

  it('ignores external links', () => {
    const body = `## Links

- [GitHub](https://github.com/example)
- [Internal](../patterns/pattern-foo.md)`;

    const links = extractLinks(body);
    expect(links).toHaveLength(1);
    expect(links[0].href).toBe('../patterns/pattern-foo.md');
  });

  it('tracks section context', () => {
    const body = `## Fits with patterns

- [pattern-a.md](../patterns/pattern-a.md)

## Architecture

Some text with [link](../patterns/pattern-b.md).`;

    const links = extractLinks(body);
    expect(links[0].section).toBe('Fits with patterns');
    expect(links[1].section).toBe('Architecture');
  });

  it('ignores non-.md links', () => {
    const body = `- [pic](image.png)
- [doc](../patterns/pattern-x.md)`;
    const links = extractLinks(body);
    expect(links).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// classifyEdge
// ---------------------------------------------------------------------------

describe('classifyEdge', () => {
  it('classifies See also as see-also', () => {
    expect(classifyEdge('pattern', 'pattern', 'See also')).toBe('see-also');
  });

  it('classifies Fits with patterns as implements', () => {
    expect(classifyEdge('vendor', 'pattern', 'Fits with patterns')).toBe('implements');
  });

  it('classifies Recommended Approaches as recommends', () => {
    expect(classifyEdge('use-case', 'approach', '5) Recommended Approaches')).toBe('recommends');
  });

  it('classifies Shortest-path patterns as in-domain', () => {
    expect(classifyEdge('domain', 'pattern', 'Shortest-path patterns')).toBe('in-domain');
  });

  it('classifies approach links as uses-pattern by default', () => {
    expect(classifyEdge('approach', 'pattern', 'Architecture')).toBe('uses-pattern');
  });

  it('classifies links to jurisdictions as regulated-by', () => {
    expect(classifyEdge('use-case', 'jurisdiction', 'Requirements')).toBe('regulated-by');
  });
});

// ---------------------------------------------------------------------------
// buildGraph (integration test against real repo)
// ---------------------------------------------------------------------------

describe('buildGraph (integration)', () => {
  const repoRoot = join(import.meta.dirname, '..', '..');
  let graph;

  // Build once for all assertions
  it('builds without errors', () => {
    graph = buildGraph(repoRoot);
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeInstanceOf(Array);
    expect(graph.edges).toBeInstanceOf(Array);
    expect(graph.meta).toBeDefined();
  });

  it('has a reasonable number of nodes (80+)', () => {
    expect(graph.nodes.length).toBeGreaterThan(80);
  });

  it('has edges', () => {
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('includes all node types', () => {
    const types = new Set(graph.nodes.map(n => n.type));
    expect(types).toContain('pattern');
    expect(types).toContain('use-case');
    expect(types).toContain('approach');
    expect(types).toContain('domain');
    expect(types).toContain('jurisdiction');
    expect(types).toContain('vendor');
  });

  it('has no dangling edges', () => {
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    for (const edge of graph.edges) {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    }
  });

  it('has meta with counts', () => {
    expect(graph.meta.node_count).toBe(graph.nodes.length);
    expect(graph.meta.edge_count).toBe(graph.edges.length);
    expect(graph.meta.generated_at).toBeTruthy();
  });

  it('pattern nodes have expected fields', () => {
    const pattern = graph.nodes.find(n => n.id === 'pattern/zk-shielded-balances');
    expect(pattern).toBeDefined();
    expect(pattern.title).toContain('ZK Shielded Balances');
    expect(pattern.layer).toBe('L2');
    expect(pattern.maturity).toBe('PoC');
    expect(pattern.summary).toBeTruthy();
    expect(pattern.content).toBeTruthy();
  });
});

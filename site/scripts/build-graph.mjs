#!/usr/bin/env node
/**
 * build-graph.mjs
 *
 * Parses all markdown content files in the IPTF Map repository and produces
 * a graph.json file with nodes (content items) and edges (cross-references).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, relative, basename, dirname } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO_ROOT = join(import.meta.dirname, '..', '..');
const OUTPUT_PATH = join(import.meta.dirname, '..', 'src', 'data', 'graph.json');

const CONTENT_DIRS = [
  { dir: 'patterns', type: 'pattern', prefix: 'pattern-' },
  { dir: 'use-cases', type: 'use-case', prefix: '' },
  { dir: 'approaches', type: 'approach', prefix: 'approach-' },
  { dir: 'domains', type: 'domain', prefix: '' },
  { dir: 'jurisdictions', type: 'jurisdiction', prefix: '' },
  { dir: 'vendors', type: 'vendor', prefix: '' },
];

const SKIP_FILES = ['_template.md', 'README.md'];

// ---------------------------------------------------------------------------
// Frontmatter parser (simple, no dependency needed)
// ---------------------------------------------------------------------------

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, body: content };

  const body = content.slice(match[0].length).trim();
  const data = {};
  let currentKey = null;
  let inArray = false;

  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item
    if (trimmed.startsWith('- ') && inArray && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(trimmed.slice(2).trim());
      continue;
    }

    // Key: value pair
    const kvMatch = trimmed.match(/^([a-z_-]+)\s*:\s*(.*)/i);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === '' || val === '|') {
        // Start of array or multiline
        inArray = true;
        data[currentKey] = [];
      } else {
        inArray = false;
        // Strip quotes
        data[currentKey] = val.replace(/^["']|["']$/g, '');
      }
    }
  }

  return { data, body };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function fileToSlug(filename, prefix) {
  return basename(filename, '.md')
    .replace(new RegExp(`^${prefix}`), '');
}

export function fileToNodeId(dirType, filename, prefix) {
  return `${dirType}/${fileToSlug(filename, prefix)}`;
}

/** Extract the first meaningful paragraph or ## Intent section as summary. */
export function extractSummary(body, maxLen = 200) {
  // Try ## Intent section first
  const intentMatch = body.match(/## Intent\s*\n+([\s\S]*?)(?=\n## |\n$)/);
  if (intentMatch) {
    const text = intentMatch[1].trim().split('\n')[0];
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  }

  // Try ## TLDR
  const tldrMatch = body.match(/## TLDR\s*\n+([\s\S]*?)(?=\n## |\n$)/);
  if (tldrMatch) {
    const text = tldrMatch[1].trim().split('\n')[0].replace(/^-\s*/, '');
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  }

  // Try ## What it is (vendors)
  const whatMatch = body.match(/## What it is\s*\n+([\s\S]*?)(?=\n## |\n$)/);
  if (whatMatch) {
    const text = whatMatch[1].trim().split('\n')[0];
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  }

  // Try ## 1) Use Case
  const ucMatch = body.match(/## 1\) Use Case\s*\n+([\s\S]*?)(?=\n## |\n$)/);
  if (ucMatch) {
    const text = ucMatch[1].trim().split('\n')[0];
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  }

  // Fallback: first non-empty, non-heading paragraph
  for (const line of body.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#') && !t.startsWith('-') && !t.startsWith('|') && !t.startsWith('*')) {
      return t.length > maxLen ? t.slice(0, maxLen) + '...' : t;
    }
  }

  return '';
}

/**
 * Extract markdown links from body text.
 * Returns array of { text, href, section } where section is the ## heading
 * the link appears under.
 */
export function extractLinks(body) {
  const links = [];
  let currentSection = '';

  for (const line of body.split('\n')) {
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      currentSection = headingMatch[1].trim();
      continue;
    }

    // Match markdown links: [text](path)
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRegex.exec(line)) !== null) {
      const href = m[2];
      // Only care about internal .md links
      if (href.endsWith('.md') && !href.startsWith('http')) {
        links.push({ text: m[1], href, section: currentSection });
      }
    }
  }

  return links;
}

/**
 * Resolve a relative link href to a node ID.
 * E.g. "../patterns/pattern-shielding.md" from approaches/ → "pattern/shielding"
 */
export function resolveLink(href, nodeIndex) {
  // Normalize: strip leading ../ segments, get just dir/file
  const parts = href.split('/').filter(p => p !== '..' && p !== '.');
  if (parts.length === 0) return null;

  const filename = parts[parts.length - 1];
  const dirName = parts.length > 1 ? parts[parts.length - 2] : null;

  // Try matching by directory name first, then fall back to trying all configs
  for (const cfg of CONTENT_DIRS) {
    if (dirName && dirName !== cfg.dir) continue;
    const candidateId = fileToNodeId(cfg.type, filename, cfg.prefix);
    if (nodeIndex.has(candidateId)) return candidateId;
  }

  return null;
}

/**
 * Classify an edge based on source node type and the section the link appears in.
 */
export function classifyEdge(sourceType, targetType, section) {
  const s = section.toLowerCase();

  if (s.includes('see also')) return 'see-also';
  if (s.includes('fits with patterns')) return 'implements';
  if (s.includes('recommended approach')) return 'recommends';
  if (s.includes('shortest-path') || s.includes('primary use case')) return 'in-domain';
  if (s.includes('adjacent vendor')) return 'in-domain';

  // By source type defaults
  if (sourceType === 'approach') return 'uses-pattern';
  if (sourceType === 'domain') return 'in-domain';
  if (sourceType === 'vendor') return 'implements';
  if (targetType === 'jurisdiction') return 'regulated-by';

  return 'see-also';
}

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------

export function buildGraph(repoRoot = REPO_ROOT) {
  const nodes = [];
  const edges = [];
  const nodeIndex = new Set();

  // Pass 1: Create all nodes
  for (const cfg of CONTENT_DIRS) {
    const dirPath = join(repoRoot, cfg.dir);
    if (!existsSync(dirPath)) continue;

    const files = readdirSync(dirPath).filter(
      f => f.endsWith('.md') && !SKIP_FILES.includes(f)
    );

    for (const file of files) {
      const content = readFileSync(join(dirPath, file), 'utf-8');
      const { data, body } = parseFrontmatter(content);

      const id = fileToNodeId(cfg.type, file, cfg.prefix);
      nodeIndex.add(id);

      const title = (data.title || basename(file, '.md'))
        .replace(/^(Pattern|Vendor|Domain):\s*/i, '');

      nodes.push({
        id,
        type: cfg.type,
        title,
        slug: fileToSlug(file, cfg.prefix),
        file: `${cfg.dir}/${file}`,
        // Metadata
        ...(data.layer && { layer: data.layer }),
        ...(data.maturity && { maturity: data.maturity }),
        ...(data.status && { status: data.status }),
        ...(data.privacy_goal && { privacy_goal: data.privacy_goal }),
        ...(data.primary_domain && { primary_domain: data.primary_domain }),
        ...(data.region && { region: data.region }),
        // Content
        summary: extractSummary(body),
        content: body,
      });
    }
  }

  // Pass 2: Extract edges from links
  const edgeSet = new Set();

  for (const cfg of CONTENT_DIRS) {
    const dirPath = join(repoRoot, cfg.dir);
    if (!existsSync(dirPath)) continue;

    const files = readdirSync(dirPath).filter(
      f => f.endsWith('.md') && !SKIP_FILES.includes(f)
    );

    for (const file of files) {
      const content = readFileSync(join(dirPath, file), 'utf-8');
      const { body } = parseFrontmatter(content);
      const sourceId = fileToNodeId(cfg.type, file, cfg.prefix);
      const links = extractLinks(body);

      for (const link of links) {
        const targetId = resolveLink(link.href, nodeIndex);
        if (!targetId || targetId === sourceId) continue;

        const targetNode = nodes.find(n => n.id === targetId);
        const targetType = targetNode ? targetNode.type : 'pattern';
        const edgeType = classifyEdge(cfg.type, targetType, link.section);
        const edgeKey = `${sourceId}|${targetId}|${edgeType}`;

        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          edges.push({
            source: sourceId,
            target: targetId,
            type: edgeType,
          });
        }
      }
    }
  }

  return {
    nodes,
    edges,
    meta: {
      generated_at: new Date().toISOString(),
      node_count: nodes.length,
      edge_count: edges.length,
    },
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain) {
  const graph = buildGraph();
  writeFileSync(OUTPUT_PATH, JSON.stringify(graph, null, 2));
  console.log(`Graph built: ${graph.meta.node_count} nodes, ${graph.meta.edge_count} edges`);
  console.log(`Written to: ${OUTPUT_PATH}`);
}

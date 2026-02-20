# IPTF Privacy Map Explorer - Technical Specification

## Overview

A static web app that visualizes the IPTF Map knowledge graph as an interactive
explorer. Built from the existing markdown content at build time, deployed as
static files to GitHub Pages.

**MVP scope:** Data pipeline + Browse view + Galaxy View (interactive graph).

---

## Architecture

```
repo root/
├── patterns/*.md          ─┐
├── use-cases/*.md          │
├── approaches/*.md         ├── Source content (existing)
├── domains/*.md            │
├── jurisdictions/*.md      │
├── vendors/*.md           ─┘
│
└── site/                  ─── New: web app
    ├── SPEC.md                 This file
    ├── scripts/
    │   └── build-graph.mjs     Markdown → graph.json pipeline
    ├── src/
    │   ├── data/
    │   │   └── graph.json      Generated at build time
    │   ├── layouts/
    │   │   └── Layout.astro    Base HTML shell
    │   ├── pages/
    │   │   ├── index.astro     Landing: Galaxy View
    │   │   └── browse.astro    Card grid browse view
    │   ├── components/
    │   │   ├── Galaxy.tsx      D3 force graph (React island)
    │   │   ├── FilterBar.tsx   Domain/layer/maturity/type/search filters
    │   │   ├── DetailPanel.tsx Slide-in panel for selected node
    │   │   ├── NodeTooltip.tsx Hover tooltip
    │   │   └── BrowseGrid.tsx  Filterable card grid
    │   └── lib/
    │       ├── graph-types.ts  TypeScript interfaces
    │       └── graph-layout.ts D3 force configuration
    ├── tests/
    │   ├── build-graph.test.mjs    Pipeline unit tests
    │   └── graph-layout.test.ts    Layout logic tests
    ├── public/
    │   └── favicon.svg
    ├── package.json
    ├── astro.config.mjs
    ├── tailwind.config.mjs
    └── tsconfig.json
```

---

## Data Model

### graph.json schema

```typescript
interface GraphData {
  nodes: Node[];
  edges: Edge[];
  meta: {
    generated_at: string;     // ISO timestamp
    node_count: number;
    edge_count: number;
  };
}

interface Node {
  id: string;                 // "pattern/zk-shielded-balances"
  type: NodeType;
  title: string;              // From frontmatter title, cleaned
  slug: string;               // URL-safe: "zk-shielded-balances"
  file: string;               // Relative path: "patterns/pattern-zk-shielded-balances.md"

  // Type-specific metadata (from frontmatter)
  layer?: "L1" | "L2" | "offchain" | "hybrid";
  maturity?: string;          // "experimental" | "PoC" | "pilot" | "prod"
  status?: "draft" | "ready";
  privacy_goal?: string;
  primary_domain?: string;
  region?: string;

  // Content
  summary: string;            // First paragraph or Intent section (~200 chars)
  content: string;            // Full markdown content (raw, rendered client-side)
}

type NodeType = "pattern" | "use-case" | "approach"
              | "domain" | "jurisdiction" | "vendor";

interface Edge {
  source: string;             // Node id
  target: string;             // Node id
  type: EdgeType;
}

type EdgeType = "see-also" | "uses-pattern" | "implements"
              | "recommends" | "in-domain" | "regulated-by";
```

### Node ID convention

- `pattern/<slug>` - e.g. `pattern/zk-shielded-balances`
- `use-case/<slug>` - e.g. `use-case/private-bonds`
- `approach/<slug>` - e.g. `approach/private-bonds`
- `domain/<slug>` - e.g. `domain/payments`
- `jurisdiction/<slug>` - e.g. `jurisdiction/eu-MiCA`
- `vendor/<slug>` - e.g. `vendor/aztec`

Slug is derived from filename: strip prefix (`pattern-`, `approach-`), strip `.md`.

### Edge extraction rules

| Source section / context            | Edge type      | Source type  | Target type |
|-------------------------------------|----------------|-------------|-------------|
| `## See also` links                 | see-also       | pattern     | pattern     |
| Approach body links to patterns     | uses-pattern   | approach    | pattern     |
| Vendor `## Fits with patterns`      | implements     | vendor      | pattern     |
| Use case `## Recommended Approaches`| recommends     | use-case    | approach    |
| Domain body links to patterns       | in-domain      | domain      | pattern     |
| Domain body links to vendors        | in-domain      | domain      | vendor      |
| Any link to jurisdictions           | regulated-by   | *           | jurisdiction|

Links are extracted by regex matching `[text](../type/file.md)` patterns in
the markdown body.

---

## Build Pipeline

`site/scripts/build-graph.mjs`:

1. Glob all `.md` files in `patterns/`, `use-cases/`, `approaches/`, `domains/`,
   `jurisdictions/`, `vendors/` (excluding `_template.md` and `README.md`)
2. For each file:
   a. Parse frontmatter with `gray-matter`
   b. Extract node metadata from frontmatter fields
   c. Extract first paragraph (or `## Intent` section) as summary
   d. Find all markdown links `[text](path)` pointing to other content files
   e. Classify each link into an edge type based on the rules above
3. Resolve link targets to node IDs (handle relative paths like `../patterns/...`)
4. Deduplicate edges
5. Write `site/src/data/graph.json`

**Invocation:** `node site/scripts/build-graph.mjs`
**Added to root package.json:** `"build:graph": "node site/scripts/build-graph.mjs"`

---

## Galaxy View (D3 Force Graph)

### Layout

D3 force simulation with these forces:

1. **Domain clustering** - 6 fixed anchor points in a 3x2 grid.
   Patterns linked to a domain are attracted toward that domain's anchor.
   Patterns linked to multiple domains position between them.

2. **Layer stratification** - Weak Y-axis force: L1 pushed down (y+),
   offchain pushed up (y-), L2 centered. Only applies to pattern nodes.

3. **Link force** - Standard D3 link force connecting nodes with edges.

4. **Collision** - Prevents node overlap. Radius based on maturity for patterns,
   fixed for other types.

5. **Center** - Keeps graph centered in viewport.

### Visual encoding

| Node type    | SVG shape      | Fill color                              | Radius  |
|------------- |----------------|-----------------------------------------|---------|
| pattern      | circle         | L1=#3B82F6, L2=#8B5CF6, off=#10B981, hybrid=#06B6D4 | by maturity: 6/10/16/22 |
| use-case     | rect (rounded) | #F59E0B                                 | 14      |
| approach     | polygon (hex)  | #EAB308                                 | 14      |
| domain       | circle         | #6B728020 fill, #6B7280 stroke          | 40      |
| jurisdiction | polygon (shield)| #EF4444                                | 10      |
| vendor       | polygon (diamond)| #14B8A6                               | 12      |

Edges: thin gray lines. On hover/select, relevant edges brighten.

### Interactions

1. **Hover node** - Tooltip with title + metadata badges + summary.
   Connected nodes highlight, others dim to 15% opacity.

2. **Click node** - Detail panel slides in (right, 380px wide).
   Shows full rendered markdown + list of connected nodes as clickable chips.
   Graph recenters on selected node.

3. **Click connection chip** - Animate graph to center on that node,
   update detail panel.

4. **Filter bar** - Dropdowns for domain, layer, maturity, type.
   Text search (Fuse.js). Non-matching nodes dim to 10% opacity.

5. **Zoom/pan** - D3 zoom behavior on the SVG container.

---

## Browse View

Filterable card grid showing all nodes. Each card shows:
- Node type badge (colored)
- Title
- Layer / maturity badges (if pattern)
- Summary text (truncated to 2 lines)
- Click → opens detail panel or navigates to Galaxy with that node selected

Filter controls: same as Galaxy filter bar.

---

## Test Plan

### Unit tests (site/tests/)

**build-graph.test.mjs:**
- Parses a sample pattern markdown file correctly (frontmatter + summary)
- Extracts "See also" links as see-also edges
- Extracts vendor "Fits with patterns" links as implements edges
- Handles missing/optional frontmatter fields gracefully
- Skips _template.md and README.md files
- Resolves relative paths to correct node IDs
- Deduplicates edges
- Produces valid graph.json structure (nodes array, edges array, meta)

**graph-layout.test.ts:**
- Domain anchor positions are correctly computed for viewport
- Layer force returns correct Y values for L1/L2/offchain
- getNodeRadius returns correct sizes for each maturity level
- getNodeColor returns correct colors for each layer
- Filter logic correctly identifies matching/non-matching nodes

### Integration test

- Run build-graph.mjs against the real repository content
- Verify node count matches expected (~100 nodes)
- Verify edge count > 0
- Verify no dangling edges (all source/target IDs exist in nodes)
- Verify all node types are represented

### Manual test

- `npm run dev` in site/ → Galaxy view renders with nodes
- Hover shows tooltip
- Click shows detail panel
- Filters dim non-matching nodes
- Browse view shows card grid
- Mobile: graceful degradation

---

## Tech Stack

| Concern     | Tool              | Version |
|-------------|-------------------|---------|
| Framework   | Astro             | 5.x     |
| UI islands  | React             | 19.x    |
| Graph       | D3.js             | 7.x     |
| Content     | gray-matter       | 4.x     |
| Markdown    | marked            | 15.x    |
| Styling     | Tailwind CSS      | 4.x     |
| Search      | Fuse.js           | 7.x     |
| Tests       | Vitest            | 3.x     |
| Deploy      | GitHub Pages      | -       |

---

## Scripts

Added to root `package.json`:
```json
{
  "build:graph": "node site/scripts/build-graph.mjs",
  "site:dev": "cd site && npm run dev",
  "site:build": "npm run build:graph && cd site && npm run build"
}
```

Site `package.json` scripts:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run"
}
```

# Vendors (adjacent tooling)

**Purpose.** Neutral documentation on products that can **complement** patterns (e.g., compliance orchestration, enterprise privacy groups). These are *not* patterns; they point to the patterns they fit with.

**Current vendors:**
- `chainlink-ace.md` — Automated compliance for digital assets; modular compliance layer with identity and policy controls
- `kaleido-paladin.md` — Programmable privacy for EVM; enterprise privacy layer with ZK UTXO, notary tokens, and private groups

## Template Structure

Each vendor file should follow this structure:

```markdown
---
title: "Vendor: [Product Name]"
status: draft
---

# [Company] - [Product] ([Brief description])

## What it is
[2-3 sentences describing the product and its primary purpose]

## Fits with patterns (names only)
- [Pattern name 1]
- [Pattern name 2]
- [Pattern name 3]

## Not a substitute for
- [What this doesn't replace]
- [Architecture gap or limitation]

## Architecture
[Technical architecture details, components, and how they work together]

## Privacy domains (if applicable)
[Different privacy approaches or modes the product supports]

## Enterprise demand and use cases
[Target segments, common implementations, buyer profiles]

## Technical details
[Implementation specifics, protocols, standards, interoperability]

## Strengths
[Key advantages and differentiators]

## Risks and open questions
[Limitations, trust assumptions, open technical questions]

## Links
[Canonical documentation and resources]
```

**House style.** Be factual and technical; avoid marketing language. Focus on architecture, technical capabilities, and how the vendor solution relates to privacy patterns.

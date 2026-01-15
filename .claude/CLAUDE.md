# IPTF Map - AI Assistant Context

## Project Overview

The **Institutional Privacy Task Force (IPTF) Map** is a public reference repository for privacy-preserving solutions in enterprise/institutional Ethereum adoption. Contains technical patterns, use cases, regulatory frameworks, and vendor evaluations.

**License:** CC0 (public domain)

## Repository Structure

```
.
├── patterns/          # Reusable technical solution cards (1-2 screen, concise)
├── use-cases/         # Business problems and privacy requirements
├── approaches/        # Detailed solutions combining multiple patterns
├── domains/           # Domain overviews (payments, custody, trading, etc.)
├── jurisdictions/     # Regulatory frameworks by region/authority
├── vendors/           # Neutral docs on Ethereum-aligned vendor products
├── GLOSSARY.md        # Privacy, blockchain, institutional, and regulatory terms
├── README.md          # User guide by persona (business, technical, legal)
└── CONTRIBUTING.md    # Contribution guidelines and semantic commits
```

## File Naming Conventions

- **Patterns:** `pattern-<slug>.md` (e.g., `pattern-zk-shielded-balances.md`)
- **Use Cases:** `<descriptive-name>.md` (e.g., `private-bonds.md`)
- **Approaches:** `approach-<use-case-slug>.md` (e.g., `approach-private-bonds.md`)
- **Vendors:** `<vendor-name>.md` (e.g., `aztec.md`, `paladin.md`)
- **Domains:** `<domain-name>.md` (e.g., `payments.md`, `custody.md`)
- **Jurisdictions:** `<region-code>-<framework>.md` (e.g., `de-eWpG.md`, `eu-MiCA.md`)

## Content Templates

Each directory has `_template.md` and `README.md`. Key structures:

### Pattern Template
- Frontmatter: title, status (draft|ready), maturity (PoC|pilot|prod), works-best-when, avoid-when, dependencies
- Sections: Intent, Ingredients, Protocol (5-8 steps max), Guarantees, Trade-offs, Example, See also

### Use Case Template
- Frontmatter: title, primary_domain, secondary_domain
- Sections: Use Case, Business Context, Actors, Problems, Recommended Approaches, Open Questions, Links

### Approach Template
- Combines multiple patterns for specific use cases
- Architecture recommendations and trade-off analysis
- Links to use cases and patterns

## Writing Guidelines

- **Be concise** - Patterns: 1-2 screens max
- **Be factual** - No marketing language
- **Cross-reference** - Link related content liberally
- **Use GLOSSARY.md** - Reference for standardized terminology (commitments, nullifiers, DvP, ERC-3643, etc.)
- **No confidential info** - Business-sensitive details go elsewhere

## Semantic Commit Convention

- `feat:` - New vendor, pattern, use case, or approach
- `fix:` - Corrections to existing content
- `docs:` - Documentation updates
- `refactor:` - Reorganizing without changing meaning
- `chore:` - Maintenance tasks

## Changelog Requirements

**Always update CHANGELOG.md** when adding new content or making significant changes:

1. Add entry to `[Unreleased]` section
2. Use semantic prefix: `feat(pattern):`, `feat(vendor):`, `fix:`, `docs:`, etc.
3. Link to the file: `[Name](path/to/file.md)`
4. Link to PR: `([#123](https://github.com/ethereum/iptf-map/pull/123))`

Example:
```markdown
- feat(pattern): [New pattern name](patterns/pattern-slug.md) ([#123](https://github.com/ethereum/iptf-map/pull/123))
```

## Content Organization

1. **Patterns** = Reusable building blocks (single architectural solution)
2. **Use cases** = Business problems, actors, constraints
3. **Approaches** = Combine patterns for specific use cases
4. **Domains** = Technical context for specific areas
5. **Jurisdictions** = Compliance requirements by region
6. **Vendors** = Implementation tools (neutral, point to patterns)

## Cross-Referencing

- Patterns → Related patterns via "See also"
- Use Cases → Approaches in "Recommended Approaches"
- Approaches → Patterns they use
- Vendors → Patterns they complement
- All content → GLOSSARY.md for term definitions

## Key Resources

- **GLOSSARY.md** - Definitions for privacy concepts (commitments, nullifiers, stealth addresses), L2 types (scaling/privacy rollups, validium), institutional terms (DvP, PvP, AoR, RFQ), standards (ERC-3643, ERC-7573, EIP-6123, EIP-5564), and regulatory frameworks
- **README.md** - Navigation guide organized by persona
- **CONTRIBUTING.md** - Contribution process and conventions
- Pattern/vendor READMEs contain organization notes and TODO lists

## Notes for AI Assistants

1. Check GLOSSARY.md for correct technical terminology
2. Follow templates strictly for consistency
3. Keep patterns concise (1-2 screens), approaches detailed but focused
4. Maintain neutral, factual tone (especially for vendors)
5. Cross-link aggressively to maintain knowledge graph
6. Use semantic commit prefixes
7. Verify Ethereum alignment when discussing vendors
8. No confidential business data in public docs

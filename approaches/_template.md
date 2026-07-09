---
# Approach card v2 frontmatter (per issue #151).
# Required fields: title, status, last_reviewed, use_case, primary_patterns.
# All others are optional.

title: "Approach: <Name>"                          # required, must match ^Approach:\s
status: draft                                      # draft | ready
last_reviewed: YYYY-MM-DD                          # ISO 8601

use_case: <slug>                                   # required; slug of use-cases/<slug>.md
related_use_cases: []                              # optional list of use-case slugs

primary_patterns: []                               # required; list of pattern-<slug>
supporting_patterns: []                            # optional; list of pattern-<slug>

# pocs: optional. EthSystems research prototypes only (use open_source_implementations
# for third-party signals). Required when an EthSystems-internal prototype exists for the
# sub-approach (not inferred from maturity alone). Each pocs[].sub_approach must
# match a ### <name> in ## Approaches.
# pocs:
#   folder: pocs/<slug>
#   requirements: pocs/<slug>/REQUIREMENTS.md
#   pocs:
#     - name: "<Implementation name>"
#       sub_approach: "<Sub-approach name matching a ### heading>"
#       spec: pocs/<slug>/<impl>/SPEC.md
#       status: spec-only | implemented | benchmarked

# open_source_implementations: optional, third-party only.
# open_source_implementations:
#   - url: https://github.com/...
#     description: "<one-line description>"
#     language: <language(s)>
---

# Approach: <Name>

## Problem framing

### Scenario

*(Optional; one or two paragraphs, ≤200 words. Concrete institutional actor with concrete numbers.)*

### Requirements

- *(Bulleted list, ≤20 words per bullet.)*

### Constraints

- *(Bulleted list. Regulatory, operational, technical. ≤20 words per bullet.)*

## Approaches

### <Sub-approach Name>

```yaml
maturity: concept                                  # concept | documented | prototyped | production
context: i2i                                       # i2i | i2u | both
crops: { cr: medium, o: yes, p: full, s: medium }  # cr: high|medium|low|none, o: yes|partial|no, p: full|partial|none, s: high|medium|low
uses_patterns: [pattern-<slug>]                    # required; subset of frontmatter primary/supporting patterns
poc_spec: pocs/<slug>/<impl>/SPEC.md               # optional
example_vendors: [<vendor-slug>]                   # optional
```

**Summary:** *(One sentence on what this sub-approach is at a high level.)*

**How it works:** *(2-4 sentences. Trust flow, where the proof or computation happens.)*

**Trust assumptions:**
- *(3-5 bullets.)*

**Threat model:**
- *(3-5 bullets.)*

**Works best when:**
- *(Bullets.)*

**Avoid when:**
- *(Bullets.)*

**Implementation notes:** *(Optional, present when a PoC has run. One paragraph on deviations from SPEC, if any.)*

#### Benchmarks

*(Optional, table.)*

| Operation | Value |
|---|---|
| Gas: transfer | ~XXXk + verification |
| Proof gen (client) | XXXms |

### <Sub-approach B>

*(Repeat the structure above for each architectural option. The comparison table below requires at least one column.)*

## Comparison

*(10 required rows; one column per sub-approach. Maturity / Context / CROPS lift from each sub-approach's YAML block. The remaining six are authorial synthesis.)*

| Axis | <Sub-approach A> | <Sub-approach B> |
|---|---|---|
| **Maturity** | <YAML lift> | <YAML lift> |
| **Context** | <YAML lift> | <YAML lift> |
| **CROPS** | <YAML lift summary> | <YAML lift summary> |
| **Trust model** | <phrase> | <phrase> |
| **Privacy scope** | <phrase> | <phrase> |
| **Performance** | <phrase or "not measured"> | <phrase> |
| **Operator req.** | Yes / No | Yes / No |
| **Cost class** | <low / medium / high> | <low / medium / high> |
| **Regulatory fit** | <phrase> | <phrase> |
| **Failure modes** | <phrase> | <phrase> |

## Persona perspectives

### Business perspective

*(80-180 words. Which sub-approach matches your revenue / cost / risk profile. Reference sub-approaches by name.)*

### Technical perspective

*(80-180 words. Engineering capacity, operational complexity, failure modes. Reference sub-approaches by name.)*

### Legal & risk perspective

*(80-180 words. Considerations and questions for legal review by the deploying institution; this is not legal advice. Frame as observations and open questions, not as endorsements.)*

## Recommendation

### Default

*(For the baseline institutional case (moderate volume, standard compliance), state which sub-approach is the default and the reasons tied to the comparison.)*

### Decision factors

- If your constraint is X, pick Y instead.
- If your constraint is Z, pick W instead.

### Hybrid

*(Optional. For composition recommendations, e.g. "L1 for high-value, L2 for frequent".)*

## Open questions

1. *(Bulleted research items, deployment unknowns, standards gaps.)*

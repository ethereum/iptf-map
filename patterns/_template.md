---
# ─── Identity ───────────────────────────────────────────────────────────────
title: "Pattern: <short name>"
status: draft | ready
# One of: research (paper only), concept (spec, no code), testnet (PoC/pilot),
#         production (mainnet with real usage).
maturity: research | concept | testnet | production
# Optional. `meta` patterns aggregate sub_patterns; see below.
type: standard | meta
layer: L1 | L2 | offchain | hybrid
last_reviewed: YYYY-MM-DD

# ─── When to use ────────────────────────────────────────────────────────────
works-best-when:
  - <1-3 bullets>
avoid-when:
  - <1-3 bullets>

# ─── Relationship context ───────────────────────────────────────────────────
# i2i = institution-to-institution, i2u = institution-to-user.
# If `both`, context_differentiation below must be filled in.
context: i2i | i2u | both

# Required when context: both. Renders as a two-column callout in the Guide.
context_differentiation:
  i2i: "Symmetric trust; both parties have legal recourse"
  i2u: "Asymmetric; CROPS must protect the user. Forced withdrawal is critical"

# ─── CROPS ──────────────────────────────────────────────────────────────────
# Badge values. Use the string 'n/a' for meta/evaluation patterns that do not
# implement privacy directly.
crops_profile:
  cr: high | medium | low | none # Censorship Resistance
  o: yes | partial | no # Openness (source availability, open standards, exit paths, forkability)
  p: full | partial | none # Privacy (who sees what)
  s: high | medium | low # Security (trust model, assumptions)

# Narrative context for each CROPS dimension — where the badges drift up or
# down in practice. Replaces the ad-hoc "CROPS context" bullet in Trade-offs.
crops_context:
  cr: "Reaches `high` on L1 permissionless pools. Drops to `low` on permissioned L2s with operator-controlled exit."
  o: "..."
  p: "..."
  s: "..."

# ─── Post-quantum exposure ──────────────────────────────────────────────────
# Replaces the ad-hoc "Post-quantum" bullet in Trade-offs.
post_quantum:
  risk: high | medium | low
  vector: "EC-based commitments (Groth16, PLONK/KZG) broken by CRQC; HNDL risk for encrypted notes"
  mitigation: "STARK-based pools with hash commitments"

# ─── Visibility matrix (optional) ───────────────────────────────────────────
# Four-slot model for transaction-level patterns: who sees what. Skip for
# infrastructure or primitive patterns where the model does not apply.
visibility:
  counterparty: [amounts, identities]
  chain: [commitments, nullifiers]
  regulator: [full_tx with viewing key]
  public: []

# ─── Standards & cross-references ───────────────────────────────────────────
# Standards this pattern relies on. Flow-style array of standard identifiers
# (ERC-XXX, EIP-XXX, ISO-XXXXX, etc.).
standards: [ERC-20, ERC-5564, EIP-7573]

# Cross-references to other patterns. Replaces the old `dependencies` field
# and the pattern-to-pattern links that used to live in `## See also`.
# Each entry is a slug matching patterns/pattern-<slug>.md — no paths, just
# the slug. The validator resolves and checks the file exists.
related_patterns:
  requires: [pattern-shielding] # hard dependency — can't implement this without it
  composes_with: [pattern-stealth-addresses] # works well together, optional
  alternative_to: [pattern-tee-based-privacy] # competing approach to the same problem
  see_also: [pattern-forced-withdrawal] # related for context

# Known implementations (plural, neutral). Renamed from "reference
# implementation" — that phrase has a specific meaning in standards contexts.
open_source_implementations:
  - url: https://github.com/Railgun-Privacy/contract
    description: "Railgun shielded pool (L1, production)"
    language: Solidity
  - url: https://github.com/AztecProtocol/aztec-packages
    description: "Aztec Network (privacy L2)"
    language: Noir

# ─── META-PATTERN ONLY (type: meta) ─────────────────────────────────────────
# DELETE THIS WHOLE BLOCK UNLESS type: meta above. The validator warns if
# sub_patterns is populated on a standard pattern.
# For meta patterns: crops_profile may be 'n/a' and ## Protocol / ## Example
# become optional. Each child is a slug resolved to patterns/pattern-<slug>.md.
# sub_patterns:
#   - name: "Onion routing (Tor-style)"
#     pattern: pattern-onion-routing
#     crops_summary: "High CR, high privacy, high latency"
#   - name: "Mixnet"
#     pattern: pattern-mixnet-anonymity
#     crops_summary: "Medium CR, full privacy, high latency"
---

## Intent

One short paragraph: the job this pattern does.

## Components

What makes up this pattern. Primitives, on-chain code, and off-chain services
all belong here. Each item gets a short note on its role.

- <Primitive or module> — <role it plays>
- <Primitive or module> — <role it plays>

If a component is also a standalone pattern in this map, link it via
`related_patterns` rather than describing it in depth here.

## Protocol

Numbered steps (5-8 max) from intent to settlement/audit. Each step is
prefixed with the actor performing it in square brackets:
`[user]`, `[contract]`, `[relayer]`, `[prover]`, `[auditor]`, `[operator]`,
`[regulator]`, etc.

1. [user] Deposit ERC-20 tokens into shielded pool contract
2. [contract] Emit commitment on-chain
3. [user] Execute shielded transfer (generate zero-knowledge proof client-side)
4. [relayer] Submit the shielded transaction for gas abstraction
5. [auditor] Verify via viewing key

Optional for `type: meta` patterns (use `sub_patterns` instead).

## Guarantees & threat model

- What it hides / proves
- Atomicity / finality
- Audit & ops signal
- Threat model: who the adversary is, what assumptions break the guarantees,
  and which failure modes are out of scope

## Trade-offs

Generic performance, cost, DX notes and failure modes. CROPS context and
post-quantum exposure now live in frontmatter (`crops_context`, `post_quantum`),
not here.

- Performance / cost / DX notes
- Failure modes & mitigations

## Example

"Bank A sells €5m zero-coupon to Bank B…" — 3-5 bullets showing flow.
Optional for `type: meta` patterns.

## See also

External references only: specs, blog posts, docs. Pattern-to-pattern links
belong in `related_patterns`.

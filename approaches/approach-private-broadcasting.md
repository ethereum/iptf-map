# Approach: Private Transaction Broadcasting

**High-level goal:** Reduce information leakage during transaction propagation that enables MEV extraction, front-running, and competitive intelligence, without changing execution semantics.

## Overview

### Problem Interaction

Broadcasting transactions reveals multiple layers of information:

1. **MEV Extraction**: Public visibility of pending transactions enables front-running and sandwiching.
2. **Intent Signaling**: Even when payloads are hidden or submitted via private channels, timing, frequency, and fee patterns can reveal participant intent.
3. **Competitive Intelligence**: Transaction metadata exposes trading strategies and institutional activity

These issues interact because transaction propagation is tightly coupled to execution ordering, while institutional privacy requirements conflict with public mempool transparency.

### Key Constraints

- Must maintain transaction validity and ordering guarantees
- Integration with existing institutional workflows and custody systems
- Privacy is typically relative (e.g., hidden from the public mempool), not absolute.

### TLDR for Different Personas

- **Business:** Execute transactions without exposing intent or enabling MEV-based extraction.
- **Technical:** Reduce public mempool exposure via private relays or encrypted propagation, accepting partial metadata leakage.
- **Legal:** Preserve auditability and post-hoc disclosure while limiting unnecessary information leakage.

## Architecture and Design Choices

### Primary Approaches

**MEV Protection (OTC Execution):**

- [Renegade](../vendors/renegade.md) for private order matching and MEV prevention
- [Flashbots](../vendors/flashbots.md) private mempools
- Direct submission to builders, bypassing the public mempool.

**Encrypted or Shielded Broadcasting (Intent-focused):**
- [Shutter Network](../patterns/pattern-pretrade-privacy-shutter-suave.md) for threshold-encrypted mempools.
- [SUAVE](../patterns/pattern-pretrade-privacy-shutter-suave.md) for private intent expression.

These approaches reduce visibility to the public mempool but do not eliminate metadata leakage to relay, builder, or execution infrastructure operators.

**Private Rollups:**

- Systems such as shared [Private Rollups](../patterns/pattern-privacy-l2s.md) (Aztec, Fhenix), or enterprise rollups: [ZKsync Prividium](../vendors/zksync-prividium.md), [EY Nightfall](../vendors/ey-nightfall.md) avoid public broadcasting by moving execution to a private environment.
- This provides stronger privacy guarantees but requires L2 migration and changes to operational workflows.
- Included here for completeness, but not a direct solution to L1 broadcasting privacy.

### Recommended Architecture

**Tiered Privacy Model:**

- **Large institutional trades:** OTC-style execution (Renegade, Flashbots) or private builder submission.
- **Regular operations:** Encrypted or shielded broadcasting to reduce public intent signaling.
- **End-to-end privacy requirements:** Consider private rollups (Aztec, Prividium) rather than broadcast-layer mitigations.

## More Details

### Trade-offs

- **Private relays / builders:** Strong protection against public MEV, but privacy is relative to relay and builder operators.
- **Encrypted broadcasting:** Compatible with existing workflows, but timing and submission patterns remain observable.
- **Private rollups:** Strong execution and state privacy, but require architectural migration and new trust assumptions.

### Interaction with Private RPC

- Broadcast privacy alone does not address information leakage from transaction construction and state access.
- In institutional settings, RPC-level metadata (what state is read, when, and how often) can leak intent even if transaction submission is private.
- Emerging approaches combine private broadcasting with [Private RPC](https://pse.dev/blog/pse-september-2025-newsletter#private-rpc) to reduce both read-side and write-side information leakage. These systems improve privacy but introduce additional trust assumptions around hardware vendors and operators.

### Open Questions

1. **Regulatory Acceptance:** How private broadcasting interacts with disclosure and market transparency requirements.
2. **Market Impact:** Effects on price discovery and market structure?
3. **Residual Leakage:** How much intent can still be inferred from timing and submission patterns.
4. **Operator Trust:** What guarantees institutions can reasonably expect from relay, builder, or TEE operators.
5. **Composability:** How private broadcasting interacts with cross-chain or multi-rollup execution.

## Links and Notes

- **Patterns:** [Pre-trade Privacy](../patterns/pattern-pretrade-privacy-shutter-suave.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md)
- **Vendors:** [Renegade](../vendors/renegade.md), [Flashbots](../vendors/flashbots.md), [Shutter](../vendors/shutter.md)

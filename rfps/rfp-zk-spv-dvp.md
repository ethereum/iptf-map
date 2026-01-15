---
title: "RFP: zk-SPV for Private Cross-Chain DvP"
status: draft
category: pse-research
tier: 2
effort: 8-12 weeks (recommend phased)
---

# RFP: zk-SPV for Private Cross-Chain DvP

## Problem

Delivery-versus-Payment (DvP) is fundamental to institutional settlement: asset and cash legs must settle atomically to eliminate principal risk. Current approaches either sacrifice privacy (public atomic swaps) or atomicity (private but conditional). Cross-chain DvP with hidden amounts and true atomicity remains unsolved.

## Why It Matters

- DvP is non-negotiable for institutional settlement (principal risk = regulatory concern)
- Cross-chain is reality: institutions operate across multiple networks
- Privacy + atomicity is the "holy grail" for institutional adoption
- Informs ERC-7573 extensions and future settlement patterns

## Scope

### In-Scope

**Phase A: Design & Specification (6-8 weeks)**
- Design space analysis for private cross-chain DvP:
  - zk-SPV (succinct cross-chain verification)
  - ZK-HTLC variants
  - Hybrid TEE + ZK settlement
  - Commit-and-prove with fallback
- Impossibility boundaries (what can't be achieved?)
- Threat model for each approach
- Protocol specification for most promising candidate

**Phase B: Reference Implementation (6-8 weeks, optional)**
- Prototype implementation
- Integration with ERC-7573 DvP standard
- Cross-chain proof-of-concept (e.g., Ethereum ↔ L2)

### Out-of-Scope

- Production deployment
- Multi-leg settlement (3+ assets) — future work
- Specific L2 integrations beyond PoC

## Deliverables

**Phase A:**
- [ ] Design space document with trade-off matrix
- [ ] Threat model per approach
- [ ] Protocol specification (cryptographic details)
- [ ] Impossibility analysis (what requires trust assumptions?)

**Phase B (if funded):**
- [ ] Reference implementation (Solidity + off-chain components)
- [ ] Integration guide for ERC-7573
- [ ] Cross-chain PoC demo

## Dependencies

**Requires:**
- Cryptographic research expertise (proof systems, light clients)
- Understanding of cross-chain finality models

**Enables:**
- Private institutional settlement infrastructure
- Extensions to ERC-7573
- Foundation for multi-leg settlement

## See Also

- [Pattern: DvP Settlement (ERC-7573)](../patterns/pattern-dvp-erc7573.md)
- [Pattern: ZK Light Client Bridge](../patterns/pattern-zk-light-client-bridge.md)
- [Use Case: Private Bonds](../use-cases/private-bonds.md)
- [ERC-7573 Specification](https://eips.ethereum.org/EIPS/eip-7573)

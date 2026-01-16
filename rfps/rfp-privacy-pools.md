---
title: "RFP: Privacy Pools Institutional Integration"
status: draft
category: grant
tier: 1
---

# RFP: Privacy Pools Institutional Integration

## Problem

Institutions need privacy but fear regulatory backlash from "black box" solutions. Privacy Pools (Buterin et al., 2023) offer a compliance-friendly approach: users can prove their funds don't come from sanctioned sources without revealing transaction history. However, this pattern isn't production-tested for institutional use cases, and lacks integration with institutional wallets and compliance workflows.

## Why It Matters

- Provides "compliance-friendly privacy" narrative for regulators
- Enables institutions to use privacy without OFAC/sanctions concerns
- Creates separation between "privacy" and "money laundering"
- Immediately demo-able value for institutional conversations

## Scope

### In-Scope

- Privacy Pools integration for institutional ERC-20 workflows:
  - Deposit with association set selection
  - Withdrawal with membership/exclusion proofs
  - Proof generation for compliance (non-sanctioned source)
- Wallet integration design:
  - Fireblocks-compatible API surface
  - Ledger Enterprise hooks
- Compliance proof SDK:
  - "Prove funds not from address set X"
  - "Prove funds from address set Y" (allowlist)
  - Proof verification for counterparties
- Association set management:
  - How institutions define "clean" sets
  - Update mechanisms and governance

### Out-of-Scope

- Novel cryptographic research (use existing Privacy Pools design)
- Full compliance platform
- Sanctions list curation (that's a data/legal problem)

## Deliverables

- [ ] Smart contracts for institutional Privacy Pools (auditable)
- [ ] Proof generation SDK (TypeScript)
- [ ] Wallet integration spec (Fireblocks/Ledger API surface)
- [ ] Association set management guide
- [ ] Example compliance workflow documentation

## Dependencies

**Requires:**
- Privacy Pools reference implementation
- Institutional wallet API documentation

**Enables:**
- Compliance-friendly privacy deployments
- Regulatory engagement with concrete demo
- Foundation for Travel Rule integration

## See Also

- [Privacy Pools Paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
- [Pattern: Shielded Pool](../patterns/pattern-shielded-pool-commitments.md)
- [Pattern: Selective Disclosure](../patterns/pattern-viewing-key-disclosure.md)
- [Compliance Primitives RFP](rfp-compliance-primitives.md)

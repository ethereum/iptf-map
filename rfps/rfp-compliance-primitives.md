---
title: "RFP: Compliance Primitives Toolkit"
status: draft
category: grant
tier: 2
---

# RFP: Compliance Primitives Toolkit

## Problem

Regulatory frameworks (MiCA, GENIUS Act) are published but lack standardized Ethereum implementations. Institutions need reusable primitives for Travel Rule compliance, KYC/AML credential verification, and audit trail generation — without building everything from scratch or relying on proprietary vendor solutions.

## Why It Matters

- Reduces barrier to compliant privacy deployments
- Creates open-source foundation others can build on
- Enables regulatory engagement with working demos
- Separates technical primitives from legal interpretation

## Scope

### In-Scope

**Technical Primitives (stable artifacts):**
- ZK credential verification library:
  - Prove KYC status without revealing identity
  - Prove accreditation without revealing net worth
  - Prove jurisdiction without revealing address
- Revocation framework:
  - Credential revocation lists (privacy-preserving)
  - Expiration and renewal mechanisms
- Travel Rule messaging plumbing:
  - Encrypted originator/beneficiary data transmission
  - Selective disclosure to counterparty compliance
  - Schema compatible with IVMS101

**Policy Mapping (versioned, non-legal):**
- Jurisdiction comparison tables (clearly dated)
- "How framework X maps to primitive Y" guides
- Explicit disclaimers (not legal advice)

### Out-of-Scope

- Legal advice or compliance certification
- Specific jurisdiction implementations
- Sanctions list curation
- Full VASP infrastructure

## Deliverables

- [ ] ZK credential verification library (TypeScript/Solidity)
- [ ] Credential revocation framework
- [ ] Travel Rule message schema (IVMS101-compatible)
- [ ] Selective disclosure protocol for counterparty compliance
- [ ] Policy mapping documents (MiCA, GENIUS Act basics)
- [ ] Integration examples with Privacy Pools

## Dependencies

**Requires:**
- ZK credential standards context (Polygon ID, etc.)
- Travel Rule messaging standards (IVMS101)

**Enables:**
- Compliant institutional deployments
- Foundation for [Privacy Pools](rfp-privacy-pools.md) compliance layer
- Regulatory demonstration capability

## See Also

- [Privacy Pools RFP](rfp-privacy-pools.md)
- [Jurisdiction: EU MiCA](../jurisdictions/eu-mica.md)
- [Jurisdiction: US GENIUS Act](../jurisdictions/us-genius-act.md)
- [Pattern: Eligibility Proofs](../patterns/pattern-eligibility-proofs-kyc.md)
- [IVMS101 Standard](https://intervasp.org/)

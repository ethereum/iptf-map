---
title: "RFP: Custody Controls Reference SDK"
status: draft
category: grant
tier: 1
effort: 8-10 weeks
---

# RFP: Custody Controls Reference SDK

## Problem

Even the best privacy L2 won't be adopted if institutional custody teams can't operate it. Current privacy solutions focus on cryptographic elegance but ignore "Day 2" operational requirements: key management, backup/recovery, segregation of duties, approval workflows, and audit logs. Custody teams at institutions have established processes; privacy solutions must integrate with them.

## Why It Matters

- Bridges gap between "testnet demo" and "production deployment"
- Addresses the #1 operational blocker for institutional adoption
- Enables custody providers (Fireblocks, Ledger Enterprise) to build integrations
- Provides reference for how privacy primitives map to custody controls

## Scope

### In-Scope

- Reference SDK for shielded asset custody operations:
  - **View key management**: Generation, storage, rotation, revocation
  - **Note management**: Backup, recovery, sync across custodians
  - **Policy-based approvals**: 4-eyes principle, threshold signatures, time locks
  - **Audit logging**: Cryptographic linkage proofs without leaking private data
- Integration adapter stubs for:
  - HSM key storage (PKCS#11 interface)
  - Institutional custody APIs (Fireblocks-style)
- Disaster recovery procedures:
  - Key rotation under compromise
  - Note recovery from backup
  - Access revocation for departed employees

### Out-of-Scope

- Full custody platform implementation
- Specific vendor integrations (provide stubs, not implementations)
- Legal/compliance certification

## Deliverables

- [ ] Reference SDK (TypeScript/Rust) with documented APIs
- [ ] View key lifecycle management module
- [ ] Note backup/recovery module
- [ ] Policy engine stub (approval workflows)
- [ ] HSM adapter interface (PKCS#11 stub)
- [ ] Operational runbook for custody teams

## Dependencies

**Requires:**
- Understanding of Aztec/privacy L2 note model
- Input from institutional custody requirements

**Enables:**
- Custody provider integrations
- Institutional pilot deployments
- Foundation for compliance workflows

## See Also

- [Pattern: Viewing Key Disclosure](../patterns/pattern-viewing-key-disclosure.md)
- [Pattern: TEE Key Manager](../patterns/pattern-tee-key-manager.md)
- [Use Case: Private Bonds](../use-cases/private-bonds.md)

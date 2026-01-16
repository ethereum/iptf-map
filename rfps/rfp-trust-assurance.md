---
title: "RFP: Trust Assurance Framework"
status: draft
category: pse-research
tier: 0
---

# RFP: Trust Assurance Framework

## Problem

Institutions evaluating privacy solutions ask "what am I trusting?" before "how fast is it?" Currently, there's no standardized way to compare trust assumptions across ZK rollups, TEE-based systems, MPC protocols, and FHE implementations. Each vendor describes trust differently, making apples-to-apples comparison impossible.

## Why It Matters

- Turns "privacy marketing" into something closer to SOC2-style assurance narratives
- Enables institutional risk teams to evaluate solutions using familiar frameworks
- Unblocks procurement decisions that stall on "we don't understand the trust model"

## Scope

### In-Scope

- Standardized "assurance card" template covering:
  - Trust roots (sequencer, prover, DA committee, TEE manufacturer)
  - Cryptographic assumptions (hardness assumptions, parameter choices)
  - Upgrade/admin key risks
  - Hardware trust surface (for TEE-based systems)
  - Failure modes (censorship, data withholding, key compromise)
  - Side-channel and metadata leakage surface
- Assurance cards for major privacy approaches:
  - ZK rollups (Aztec-style)
  - TEE-based privacy (SGX/SEV/Nitro)
  - MPC coordination
  - FHE computation
- Controls mapping: what institutions can mitigate via audits, attestation, key management

### Out-of-Scope

- Full security audits of specific implementations
- Legal/compliance assessments
- Performance benchmarking (see [Benchmark Dashboard](rfp-benchmark-dashboard.md))

## Deliverables

- [ ] Assurance card template (markdown format, compatible with iptf-map patterns)
- [ ] 4-6 completed assurance cards for major privacy system types
- [ ] "Red team scenarios" document (3-5 attack scenarios per system type)
- [ ] Controls mapping guide for institutional risk teams

## Dependencies

**Requires:**
- Access to public documentation for major privacy systems
- Review of existing threat models (where published)

**Enables:**
- Informed institutional procurement decisions
- Foundation for [Benchmark Dashboard](rfp-benchmark-dashboard.md) trust dimensions
- Input to custody and compliance RFPs

## See Also

- [Pattern: TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)
- [Pattern: Threshold Encrypted Mempool](../patterns/pattern-threshold-encrypted-mempool.md)
- [Vendors](../vendors/) — Systems to analyze
- [GitHub Issue #27](https://github.com/ethereum/iptf-map/issues/27) — Performance and trust assumptions mapping

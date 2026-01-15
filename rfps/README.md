# RFPs: Research & Grant Proposals

Preliminary research proposals for PSE (Privacy & Scaling Explorations) researchers and external grants. These are **non-critical-path** work items that strengthen the broader privacy ecosystem.

## Relationship to IPTF Core Work

| | IPTF Core Team | RFPs |
|---|----------------|------|
| **Focus** | Institutional PoCs (private bonds, stablecoins, DvP) | Research, tooling, benchmarks |
| **Dependency** | Self-contained | No dependency on core team |
| **Goal** | Prove it works for specific use cases | Make ecosystem better for everyone |

RFPs are **accelerators, not blockers**. They feed back into the public iptf-map repo but don't gate current PoC work.

## Categories

### PSE Research

Deep cryptographic/systems research requiring specialized expertise:
- Protocol design and threat modeling
- Cryptographic primitives research
- Trust assumption analysis

### Grants

Tightly-scoped tooling and integration work suitable for external teams:
- Benchmarking infrastructure
- SDK development
- Documentation and comparisons

## Priority Tiers

### Tier 0: Do First (Unlocks Other Work)

| RFP | Category | Why First |
|-----|----------|-----------|
| [Trust Assurance Framework](rfp-trust-assurance.md) | PSE Research | Institutions ask "what am I trusting?" before "how fast?" |
| [Living Benchmark Dashboard](rfp-benchmark-dashboard.md) | Grant | All performance claims depend on credible data |

### Tier 1: High Institutional Demand

| RFP | Category | Why Now |
|-----|----------|---------|
| [Private Reads / RPC Privacy](rfp-private-reads.md) | PSE Research | Metadata leakage before tx submission is a silent killer |
| [Custody Controls SDK](rfp-custody-sdk.md) | Grant | "Day 2" operational blocker for institutions |
| [Privacy Pools Integration](rfp-privacy-pools.md) | Grant | Compliance-friendly privacy narrative |

### Tier 2: Strategic (Longer Horizon)

| RFP | Category | Notes |
|-----|----------|-------|
| [zk-SPV for Private DvP](rfp-zk-spv-dvp.md) | PSE Research | Cross-chain settlement with privacy + atomicity |
| [Compliance Primitives Toolkit](rfp-compliance-primitives.md) | Grant | ZK credentials, Travel Rule plumbing |

## Summary

| Category | Count | Focus |
|----------|-------|-------|
| PSE Research | 3 | Protocol design, threat models, cryptographic research |
| Grants | 4 | Tooling, integrations, benchmarks, documentation |

## How to Propose New RFPs

1. Use the [RFP template](_template.md)
2. Open a PR with the new RFP file
3. Ensure no confidential institutional details are included
4. Link to relevant patterns/use-cases in this repo

## See Also

- [Patterns](../patterns/) — Technical building blocks these RFPs may produce
- [Use Cases](../use-cases/) — Business problems RFPs help address
- [PSE Roadmap](https://ethereum-magicians.org/t/pse-roadmap-2025-and-beyond/25423) — Broader PSE research directions

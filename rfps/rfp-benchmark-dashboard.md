---
title: "RFP: Living Benchmark Dashboard"
status: draft
category: grant
tier: 0
---

# RFP: Living Benchmark Dashboard

## Problem

Privacy L2 vendors claim 25k+ TPS, but institutions have no way to verify these claims for their specific workloads. One-off benchmark reports expire quickly (hard forks, client updates invalidate results within months). Institutions need continuously-updated, reproducible benchmarks they can trust.

## Why It Matters

- Replaces "trust the vendor" with "run this yourself"
- Provides credible data for institutional architecture decisions
- Creates accountability: vendors can't make unverifiable claims
- Supports ongoing comparison as systems mature

## Scope

### In-Scope

- Automated benchmark pipeline (CI/CD) that runs weekly on latest builds
- Benchmark harnesses for institutional workloads:
  - Private transfer (shielded send with nullifier update)
  - DvP settlement pattern
  - Batch operations (10, 100, 1000 txs)
  - Compliance proof generation
- Target systems (public testnets where available):
  - **Privacy L2s** (see [L2 Privacy Evaluation Pattern](../patterns/pattern-l2-privacy-evaluation.md)):
    - *Public L2*: Aztec, Miden, Intmax
    - *AppChain SDK*: Prividium, EY Nightfall, Scroll Cloak
  - **Privacy App Layers**:
    - Zama fhEVM (coprocessor)
    - Kaleido/Paladin (L1 privacy)
    - Railgun (L1 shielded pool)
- Metrics per system (see [L2 Privacy Evaluation Pattern](../patterns/pattern-l2-privacy-evaluation.md) for full criteria):
  - **Performance**: Throughput (TPS<sub>Public</sub>/TPS<sub>Private</sub>), latency, finality
  - **Cost**: Gas usage, bridging costs, forced exit costs
  - **Privacy**: What is hidden, from whom, trust model
  - **Security**: Sequencer decentralization, censorship resistance, upgrade process
  - Trust dimensions (from [Trust Assurance](rfp-trust-assurance.md))
- Dockerized reproduction: anyone can run `docker-compose up` to verify

### Out-of-Scope

- Proprietary/closed systems without public access
- Legal analysis of results
- Optimization recommendations (that's vendor work)

## Deliverables

- [ ] Benchmark harness repo (open source, Docker-based)
- [ ] CI pipeline that runs weekly and publishes results
- [ ] Comparison dashboard (static site or markdown in iptf-map)
- [ ] Methodology document (how to interpret results, caveats)
- [ ] Integration with iptf-map vendor pages (automated updates)

## Dependencies

**Requires:**
- Public testnet access for target systems
- Clear workload definitions (coordinate with IPTF team)
- Trust schema from [Trust Assurance](rfp-trust-assurance.md) for complete picture

**Enables:**
- Data-driven vendor comparisons
- Input to [L2 Privacy Comparison Matrix](https://github.com/ethereum/iptf-map/issues/27)
- Credible "reality check" for institutional presentations

## See Also

- [GitHub Issue #27](https://github.com/ethereum/iptf-map/issues/27) — Performance and trust assumptions mapping
- [Vendors](../vendors/) — Systems to benchmark
- [Pattern: DvP Settlement](../patterns/pattern-dvp-erc7573.md) — Example workload

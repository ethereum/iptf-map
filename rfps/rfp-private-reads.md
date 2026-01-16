---
title: "RFP: Private Reads / RPC Privacy"
status: draft
category: pse-research
tier: 2
---

# RFP: Private Reads / RPC Privacy

## Problem

Most institutional privacy discussions focus on transaction privacy (hiding sender, receiver, amount). But institutions leak sensitive information *before* ever posting a transaction: RPC queries reveal portfolio positions, trading intent, counterparty relationships, and risk exposures. An observer monitoring RPC traffic can infer strategy without seeing any on-chain activity.

**Note:** This is less of a pain point for large institutions that run their own nodes. For them, [private transaction broadcasting](../patterns/pattern-private-transaction-broadcasting.md) is a more significant need. This RFP targets smaller institutions or those using third-party RPC providers.

## Why It Matters

- Metadata leakage is the "silent killer" of institutional privacy
- Query patterns can reveal more than transaction data (positions, limits, counterparties)
- Institutions often have strict internal rules about data access trails
- Aligns with PSE roadmap emphasis on "private reads" (ORAM/PIR research)

## Scope

### In-Scope

- Design space analysis for private read approaches:
  - ORAM (Oblivious RAM) for state access
  - PIR (Private Information Retrieval) for queries
  - TEE-based private RPC (with explicit trust analysis)
  - Mixnet/anonymization layers
- Benchmark harness for institutional query patterns:
  - Portfolio valuation (read-heavy, multiple token balances)
  - Eligibility checks (KYC gating, accreditation status)
  - Risk checks (position limits, concentration)
- "What leaks where" analysis:
  - IP address correlation
  - Timing analysis
  - Query volume patterns
  - Address clustering risks
- Minimal prototype for at least one approach

### Out-of-Scope

- Full production implementation
- Network-level anonymity (Tor, mixnets) — mention but don't build
- Transaction privacy (covered by other patterns)

## Deliverables

- [ ] Design space document comparing ORAM/PIR/TEE approaches
- [ ] "What leaks where" threat model for institutional RPC usage
- [ ] Benchmark harness for private read latency/throughput
- [ ] Minimal prototype (ORAM proxy or TEE-based RPC)
- [ ] Recommendations for institutional deployment

## Dependencies

**Requires:**
- PSE ORAM/PIR research context
- Understanding of institutional query patterns

**Enables:**
- Complete privacy story (reads + writes)
- Input to custody and compliance workflows
- Foundation for "private RPC" infrastructure

## See Also

- [PSE Roadmap: Private Reads](https://ethereum-magicians.org/t/pse-roadmap-2025-and-beyond/25423)
- [Pattern: Private Transaction Broadcasting](../patterns/pattern-private-transaction-broadcasting.md)
- [Pattern: TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)

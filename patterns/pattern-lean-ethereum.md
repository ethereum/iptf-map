---
title: Lean Ethereum
status: draft
maturity: research
works-best-when:
  - Long-term Ethereum consensus redesign needed
  - Solo validation accessibility matters
avoid-when:
  - Near-term deployment required (4–5 year horizon)
dependencies: [Post-quantum signatures, minimal zkVMs, P2P networking upgrades]
---

## Intent

A long-range redesign of Ethereum’s consensus layer aiming to enter in action around 2030. Lean consolidates multiple research tracks into a single major fork, reducing hardware requirements, improving validator accessibility, enabling fully verifying light clients on minimal devices, and preparing for a post-quantum world.

## Ingredients

- Specifications (in development)

  - Post-quantum hash-based multisignatures
  - Minimal zkVMs for signature aggregation & proof compression
  - Networking upgrades: Gossipsub v2, rateless set reconciliation
  - Finality research (e.g., low-slot-count fast finality variants)
  - Validator set expansion & economics (lower thresholds under discussion)

- Infrastructure

  - ~15 client teams prototyping implementations across Rust, Zig, C, C++, Go, Java, .NET, TypeScript, Nim, Elixir
  - Formal verification tooling (Lean 4)
  - Cryptanalysis and protocol correctness research (Poseidon, hash-based schemes)

- Research tracks

  - Post-quantum signature design & aggregation
  - Minimal zkVM architecture
  - Formal methods & proof automation
  - Set reconciliation & P2P efficiency

## Protocol (concise)

1. Introduce post-quantum multisignatures

   - Hash-based multisig schemes explored (e.g., XMSS/Winternitz variants).

2. Use minimal zkVMs for signature aggregation

   - Off-chain aggregation verified via succinct proofs.
   - Exact workflow under active research.

3. Expand validator participation

   - Lower hardware & bandwidth requirements.
   - Reduced stake requirements to 1 ETH.
   - Tiered validator responsibilities under exploration.

4. Shorter slot times & faster finality

   - Targeting ~4s slot times (as explored in roadmap).
   - Fast-finality schemes (e.g., 3-slot variants) under evaluation; parameters TBD.

5. Deploy upgraded networking

   - Gossipsub v2 for throughput and DOS-resilience.
   - Rateless set reconciliation to support large validator sets.

6. Enable full light-client verification on minimal devices

   - Small-footprint consensus proofs verifiable on mobile/IoT class hardware.

## Guarantees (intended outcomes)

- Protocol ossification, after the Lean fork, consensus enters long-term stability / minimal changes.
- Post-quantum resilience, core signatures hardened against quantum adversaries.
- Validator decentralization, vastly increased solo staking due to lower hardware & stake requirements.
- Universal light clients, full consensus verification without trust assumptions.
  DOUBT
- Clear boundaries, lean modifies consensus _only_, execution-layer scaling & privacy handled by separate tracks.

## Trade-offs

- Timeline risk: 4–5 year horizon with heavy reliance on open research questions
- Single large fork: Failure at any component delays entire bundle
- Research coupling: PQ signatures, zkVMs, and P2P upgrades must all reach production readiness
- Consensus-only scope: Does not address L1 execution scaling or transaction privacy

## Example (illustrative)

A consumer-grade laptop runs a solo validator at a much lower stake threshold. A minimal zkVM compresses committee signatures off-chain into a single proof verifiable in milliseconds. The network operates at ~4-second slots with low-slot-count fast finality. A mobile phone verifies the full consensus rules independently. After rollout, Ethereum’s consensus remains stable for decades.

## See also

- [Lean Roadmap](https://leanroadmap.org/)
- [Lean Specification repository](https://github.com/leanEthereum/leanSpec)

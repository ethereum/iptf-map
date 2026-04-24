---
title: "Pattern: Lean Ethereum"
status: draft
maturity: research
type: standard
layer: L1
last_reviewed: 2026-04-22

works-best-when:
  - A long-term redesign of Ethereum consensus is on the table.
  - Solo-validator accessibility and light-client verifiability matter.
  - Post-quantum resilience of the consensus layer is a design goal.
avoid-when:
  - Near-term deployment is required; the research horizon is multi-year.
  - Only execution-layer scaling or transaction privacy is in scope.

context: both
context_differentiation:
  i2i: "Between institutions the relevant properties are validator economics, finality guarantees, and post-quantum signature aggregation. Institutions running staking nodes benefit from lower hardware requirements and from formal verification of the signature scheme."
  i2u: "For end users the relevant property is trustworthy light-client verification on minimal devices. A user who runs a mobile light client can verify consensus independently, without relying on a hosted RPC. Validator decentralization also reduces the risk that a small operator set can collude against users."

crops_profile:
  cr: high
  o: yes
  p: none
  s: medium

crops_context:
  cr: "Lowering the solo-staking threshold and expanding the validator set raises censorship resistance at the consensus layer. Execution-layer CR still depends on the application stack above."
  o: "Specifications and reference implementations are developed in the open across many client teams; formal verification artifacts (Lean 4) are public."
  p: "The pattern does not add transaction privacy. Privacy is handled by separate execution-layer tracks that can run on top of a Lean consensus."
  s: "Strength of the final construction depends on the cryptanalysis of the chosen post-quantum signature, the correctness of the minimal zkVM, and the stability of networking upgrades. Each of these is an open research question."

post_quantum:
  risk: low
  vector: "The pattern itself targets post-quantum resilience by replacing EC signatures with hash-based multisignatures, so it reduces the core signature-layer PQ risk."
  mitigation: "Hash-based multisignatures (XMSS/Winternitz-family candidates) aggregated via a minimal zkVM."

standards: []

related_patterns:
  see_also: [pattern-eil, pattern-focil-eip7805, pattern-native-account-abstraction]

open_source_implementations:
  - url: https://github.com/leanEthereum/leanSpec
    description: "Lean specification repository with work-in-progress drafts across consensus, signatures, and networking"
    language: Markdown
---

## Intent

Plan a long-range redesign of the Ethereum consensus layer, targeting a single major fork around 2030 that consolidates several research tracks: post-quantum signatures, minimal zkVMs for signature aggregation and proof compression, reduced hardware and stake thresholds for validators, and networking upgrades that support a larger validator set. The goal is a consensus protocol that is stable for decades, resilient against quantum adversaries, and verifiable on minimal devices.

## Components

- Post-quantum hash-based multisignatures, with an aggregation scheme suited to large validator sets.
- Minimal zkVMs used to compress aggregated signatures and consensus proofs into succinct artifacts.
- Networking upgrades: Gossipsub v2 for throughput and DOS resilience, and rateless set reconciliation to support very large validator sets.
- Lower validator thresholds in hardware, bandwidth, and stake, making solo staking accessible on commodity devices.
- Formal verification tooling (Lean 4) used to prove key properties of the signature aggregation and consensus logic.
- Approximately fifteen client teams implementing the specification across Rust, Zig, C, C++, Go, Java, .NET, TypeScript, Nim, and Elixir.

## Protocol

1. [researcher] Select and cryptanalyze a post-quantum hash-based multisignature scheme suited to aggregation.
2. [researcher] Design a minimal zkVM that verifies and compresses aggregated signatures.
3. [client-team] Prototype the consensus upgrade across independent client teams to stress-test the specification.
4. [validator] Run consensus at lower hardware and stake thresholds; participate with reduced bandwidth requirements.
5. [network] Deploy Gossipsub v2 and rateless set reconciliation to support the expanded validator set.
6. [light-client] Verify consensus proofs independently on mobile or IoT-class hardware.

## Guarantees & threat model

Guarantees:

- Protocol stability: after the upgrade, consensus enters a phase of minimal change.
- Post-quantum resilience for the core signature layer.
- Lower barriers to solo validation, improving validator decentralization.
- Light-client verification of full consensus rules on minimal hardware.
- Clear scope: limited to consensus; execution-layer scaling and privacy are handled by separate tracks.

Threat model:

- Cryptanalysis of the chosen hash-based multisignature and its aggregation must hold.
- The minimal zkVM must be sound and formally verified; a flaw compromises the compressed proofs.
- Networking upgrades must preserve liveness under large validator counts and adversarial churn.
- Coordination risk: if one research track fails to ship, the bundled fork is delayed.
- Out of scope: transaction privacy, execution scaling, MEV dynamics.

## Trade-offs

- Multi-year horizon with heavy dependence on open research questions across cryptography, proof systems, and networking.
- Single bundled fork means a failure in one component delays the entire upgrade.
- Consensus-scoped: does not address execution-layer scaling or transaction privacy.
- Coordination across many client teams adds engineering overhead but also resilience.

## Example

A consumer-grade laptop runs a solo validator at a stake threshold around 1 ETH. A minimal zkVM compresses committee signatures off-chain into a single proof that any node verifies in milliseconds. The network operates at roughly four-second slots with a fast-finality variant under evaluation. A mobile phone verifies the full consensus rules independently.

## See also

- [Lean Roadmap](https://leanroadmap.org/)
- [Lean Specification repository](https://github.com/leanEthereum/leanSpec)

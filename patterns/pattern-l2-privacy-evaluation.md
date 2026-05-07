---
title: "Pattern: L2 Privacy Evaluation Framework"
status: draft
maturity: concept
type: standard
layer: L2
last_reviewed: 2026-04-22

works-best-when:
  - Multiple privacy L2s must be compared for an institutional deployment decision.
  - Throughput, security, and censorship resistance have to be placed side by side across heterogeneous architectures.
  - A consistent, sourced methodology is needed so that procurement and risk teams can review the same evidence.
avoid-when:
  - The L2 under review has no privacy features; use a general L2 scorecard instead.
  - A single vendor is already chosen and only vendor docs need verification.

context: both
context_differentiation:
  i2i: "Between institutions the framework is used by procurement, risk, and ops teams to weigh counterparty-aligned criteria such as force-inclusion SLAs, compliance features, and DA trust assumptions. Both sides can cross-review the filled table."
  i2u: "For user-facing deployments the framework surfaces asymmetries that matter to end users: client proving cost, availability of forced exits without operator cooperation, and whether disclosure can be compelled unilaterally by the operator."

crops_profile: "n/a"

post_quantum:
  risk: low
  vector: "The framework itself is a methodology, not a cryptographic primitive. One of its rows (`PQ Security`) flags HNDL exposure in the evaluated systems."
  mitigation: "Encourage each system to report post-quantum readiness in its row, and re-evaluate as systems migrate proof systems."

standards: []

related_patterns:
  see_also: [pattern-privacy-l2s, pattern-hybrid-public-private-modes, pattern-shielding, pattern-forced-withdrawal]

open_source_implementations:
  - url: https://github.com/l2beat/l2beat
    description: "L2Beat open dataset and risk methodology used as a baseline for independently verified metrics"
    language: TypeScript
---

## Intent

Give institutions a vendor-neutral, sourced methodology for comparing privacy-preserving L2 solutions across performance and cost, privacy and Data Availability, and security and governance. The framework defines a common workload so that self-reported metrics can be placed next to independent benchmarks on the same axes.

> Note: this card is an evaluation framework, not a reusable privacy primitive. `pattern-privacy-l2s` is the actual L2 pattern; this one documents how to compare privacy L2s. Candidate for relocation to `approaches/` or a methodology section in a follow-up.

## Components

- Self-reported metric sheets collected from each L2 team, with a source link per cell.
- Independent benchmarks and risk reviews used to cross-check the self-reported values.
- A standardized workload (Simple Value Transfer) that fixes what a transaction means across heterogeneous architectures.
- A disclosure convention that records what each metric measures, what is excluded, and whether a value is `Pending` or `N/A`.

## Protocol

1. [evaluator] Adopt Simple Value Transfer as the baseline workload.
2. [evaluator] Request each L2 team to fill the three evaluation tables (performance, privacy and DA, security and governance).
3. [evaluator] Require a source link for every claim (benchmark run, docs page, or paper).
4. [evaluator] Mark `Pending` where data is missing and `N/A` where the metric does not apply to that architecture.
5. [evaluator] Produce the comparative view; highlight trade-offs that matter for the target use case.
6. [evaluator] Re-run the exercise on hard forks, client updates, or when a new benchmark is published.

## Evaluation criteria

### 1. Performance and cost

| Metric                     | Discrete metrics                                                                                                             |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| Max Throughput         | Max theoretical TPS, tested peak TPS (with benchmark link). Report TPS<sub>Public</sub> and TPS<sub>Private</sub> separately |
| Transaction cost       | Gas usage in `L1 gas units` + `L2 gas units` for Simple Value Transfer                                                       |
| Bridging and exit      | L2 to L1 withdrawal and forced exit cost (gas units)                                                                         |
| Finality time          | `Soft Finality` (L2 inclusion), `Hard Finality` (L1 commitment + proof), `Challenge Period`                                  |
| Transaction retrieval  | Sync mechanism (`Trial decryption`, `Detection Keys`, `Server-side filtering`) and sync speed                                |

### 2. Privacy and Data Availability

| Metric                    | Discrete metrics                                                                                                                      |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| Level of privacy      | What: `Balance`, `Sender/Receiver`, `Amount`, `Code/Function`, `Contract Bytecode`. Who sees: `Public`, `Sequencer`, `Prover` |
| DA layer              | `L1 Call Data`, `L1 Data Blobs (EIP-4844)`, `External DAC`                                                                            |
| DA trust              | `Trustless/L1-secured`, `Trusted DAC`                                                                                                 |
| Data posted to L1     | `Full Transaction Data`, `State Diff`, `Validity Proof Only`                                                                          |
| Compliance features   | `Incoming Viewing Key`, `Outgoing Viewing Key`, `Full History Viewing Key`                                                            |
| Privacy trust model   | Base: `Cryptographic`, `Threshold (MPC/FHE)`. Collusion threshold: m-of-n                                                     |
| Network privacy       | RPC privacy options (`Tor/I2P`, `Oblivious HTTP`, `Mixnet`)                                                                           |

### 3. Security and governance

| Metric                         | Discrete metrics                                                                                                                                                                       |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sequencer decentralization | `Centralized`, `Permissioned Set`, `Decentralized Auction`, `Based (L1 Sequencing)`                                                                                                    |
| Censorship resistance      | Mechanism: `Force inclusion`, `Escape Hatch`, `Council`. User burden: `Stateless`, `Merkle Witness`, `Full State Reconstruction`. Latency: `Immediate`, `Challenge Period` |
| Prover mechanism           | Access: `Whitelist`, `Permissionless`. System: `Plonk`, `Stark`, `FHE`, `Groth16`                                                                                              |
| Upgrade process            | Governance: `Multisig (m-of-n)`, `Immutable`, `DAO Vote`. Timelock: delay in days or hours                                                                                     |
| Client-side requirements   | Client proving: `Yes`/`No`. Features: `Mobile Proving`, `Trusted Delegation`, `Blind Delegation`                                                                               |
| Finality security          | `Validity (ZK)`, `Optimistic (Fraud Proofs)`                                                                                                                                           |
| Proof system setup         | `Trusted Ceremony`, `Transparent`                                                                                                                                                      |
| Programmability            | Language: `EVM/Solidity`, `DSL`, `WASM`. Deployment: `Permissionless`, `Whitelisted`                                                                                           |
| PQ security                | Susceptible to HNDL attacks? (`Yes`/`No`)                                                                                                                                              |

## Simple Value Transfer

A protocol-native payment where a sender transfers an ERC-20 amount to a single recipient, resulting in a valid state transition. TPS<sub>Public</sub> measures transfer semantics that are publicly observable (L2 inclusion plus validity). TPS<sub>Private</sub> measures a full privacy mode that hides sender, recipient, and amount as applicable; optional features are excluded unless they are mandatory in the protocol. Features excluded when reporting TPS must not be implicitly assumed elsewhere. The definition does not equalize DA models, finality, confirmation UX, compliance features, or off-chain coordination.

## Guarantees & threat model

Guarantees:

- Consistent comparison criteria across heterogeneous L2 architectures.
- Separation of self-reported metrics from independently verified metrics.
- Clear visibility into what each system hides and from whom.
- Traceable claims: every metric requires a source.

Threat model:

- Self-reported metrics may be optimistic; the source link is what anchors them.
- Some systems do not map cleanly to every row; the `N/A` marker is load-bearing.
- Criteria drift over time; periodic re-evaluation is required.

## Trade-offs

- The exercise is labor-intensive; automation via a benchmark pipeline helps.
- Architectural heterogeneity makes equal-weight scoring misleading; use the tables as input to a weighted decision, not an output score.
- Frozen snapshots age quickly; timestamp every filled table and link back to source commits where possible.

## Targeted systems

Privacy L2s currently in scope: Aztec, Miden, Intmax, Prividium, Scroll Cloak, EY Nightfall. The framework also applies to privacy app layers on existing chains (shielded pools, enterprise privacy layers, FHE coprocessors), which share DA but not sequencer assumptions.

## Results snapshot

Results below are drawn from public documentation and independent sources. Empty cells indicate data not yet publicly available; each published snapshot must be timestamped.

| Protocol         | Deployment   | Privacy model      | Proof system       | DA                      | Client proving          | Censorship resistance |
| :--------------- | :----------- | :----------------- | :----------------- | :---------------------- | :---------------------- | :-------------------- |
| Aztec        | Public L2    | Cryptographic (ZK) | UltraHonk          | L1 Blobs                | Yes (heavy)             | Escape Hatch          |
| Miden        | Public L2    | Cryptographic (ZK) | STARK (Winterfell) | L1 Blobs                | Yes (can be delegated)  | TBD                   |
| Intmax       | Public L2    | Cryptographic (ZK) | Plonk/Gnark        | Stateless (Client-Side) | Yes (light)             | Force Inclusion       |
| Prividium    | AppChain SDK | Cryptographic (ZK) | Boojum/Plonk       | External (Private DB)   | No (server)             | Operator-dependent    |
| Scroll Cloak | AppChain SDK | Cryptographic (ZK) | Scroll zkEVM       | Host chain              | No (prover service)     | Force Exit to host    |
| EY Nightfall | AppChain SDK | Cryptographic (ZK) | UltraPlonk         | L1 Call Data            | Yes                     | TBD                   |

AppChain SDKs have deployment-dependent assumptions (sequencer, DA, governance) that vary by operator. Public L2s offering hybrid modes (Aztec, Miden) let the developer choose between a public account model and a private UTXO note model; stateless or validium designs (Intmax, Prividium, Scroll Cloak) hide balances and transfer data by default.

Snapshot last refreshed 2026-01-27. Sources: [L2Beat](https://l2beat.com/), [Aztec Docs](https://docs.aztec.network/), [Miden VM](https://0xmiden.github.io/miden-vm/), [Intmax](https://intmax.io/), [Intmax2 Paper](https://eprint.iacr.org/2023/1082.pdf), [Prividium Docs](https://docs.zksync.io/zk-stack/prividium), [Cloak Docs](https://scroll-tech.github.io/cloak-documentation/), [Nightfall_4](https://github.com/EYBlockchain/nightfall_4_CE).

## Example

An OTC settlement team filters the table for cryptographic privacy, requires viewing keys for audit support, compares client proving cost against trust assumptions, and reviews censorship-resistance SLAs before choosing between an AppChain SDK and a public privacy L2.

## See also

- [RFP: Living Benchmark Dashboard](../rfps/rfp-benchmark-dashboard.md) - automated benchmark pipeline.
- [L2Beat](https://l2beat.com/) - independent L2 risk analysis.
- [Post-Quantum Threats](../domains/post-quantum.md)

---
title: "Pattern: L2 Privacy Evaluation Framework"
status: provisional
maturity: PoC
layer: L2
privacy_goal: Structured methodology for institutions to compare privacy-preserving L2 solutions
assumptions: L2 teams provide self-reported metrics with sources; independent verification where possible
last_reviewed: 2026-01-27
provisional_reason: "Awaiting L2 vendor self-reported metrics"
provisional_since: 2026-01-27
works-best-when:
  - Evaluating multiple privacy L2s for institutional deployment
  - Comparing throughput, security, and censorship-resistance across systems
  - Need consistent criteria across heterogeneous architectures
avoid-when:
  - Evaluating general-purpose L2s without privacy features
  - Single-vendor evaluation (use vendor docs directly)
dependencies: []
---

## Intent

Provide institutions with a structured, vendor-neutral framework to compare privacy-preserving L2 solutions across performance, privacy/DA, and security dimensions. Enables apples-to-apples comparison despite architectural differences.

## Ingredients

- Self-reported metrics from L2 teams (with sources)
- Independent benchmarks where available (L2Beat, academic papers)
- Standardized workload definitions (Simple Value Transfer)
- Clear disclosure of what each metric measures

## Protocol

1. **Define workload**: Use [Simple Value Transfer](#simple-value-transfer) as baseline
2. **Collect metrics**: Request L2 teams fill in the three evaluation tables
3. **Verify sources**: Each claim must link to benchmark, docs, or paper
4. **Flag gaps**: Mark "Pending" for missing data, "N/A" for inapplicable metrics
5. **Compare**: Use tables to identify trade-offs relevant to your use case
6. **Re-evaluate**: Update as systems mature (hard forks, client updates)

## Evaluation Criteria

### 1. Performance & Cost

| Metric                     | What is Measured                          | Discrete Metrics                                                                                                             |
| :------------------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Max Throughput**         | Maximum sustained TPS                     | Max theoretical TPS, Tested Peak TPS (with benchmark link). Report TPS<sub>Public</sub> and TPS<sub>Private</sub> separately |
| **Transaction Cost**       | Total cost per L2 transaction             | Gas usage in `L1 gas units` + `L2 gas units` for Simple Value Transfer                                                       |
| **Bridging & Exit Costs**  | Cost of L1↔L2 asset movement              | L2→L1 withdrawal (gas units), Forced Exit to L1 (gas units)                                                                  |
| **Economic Finality Time** | Time until L1 validation                  | `Soft Finality` (L2 inclusion), `Hard Finality` (L1 commitment + proof), `Challenge Period`                                  |
| **Transaction Retrieval**  | Bandwidth/time to retrieve incoming funds | Sync mechanism (`Trial decryption`, `Detection Keys`, `Server-side filtering`), Sync speed (e.g., "time to sync 10k blocks") |

### 2. Privacy & Data Availability

| Metric                    | What is Measured                             | Discrete Metrics                                                                                                                      |
| :------------------------ | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Level of Privacy**      | Scope of hidden information                  | **What**: `Balance`, `Sender/Receiver`, `Amount`, `Code/Function`, `Contract Bytecode`. **Who sees**: `Public`, `Sequencer`, `Prover` |
| **DA Layer\***            | Where state reconstruction data is posted    | `L1 Call Data`, `L1 Data Blobs (EIP-4844)`, `External DAC`                                                                            |
| **DA Trust Assumption\*** | Parties user must trust for data access      | `Trustless/L1-secured`, `Trusted DAC`                                                                                                 |
| **Data Posted to L1\***   | Information broadcast for state verification | `Full Transaction Data`, `State Diff`, `Validity Proof Only`                                                                          |
| **Compliance Features**   | Selective disclosure mechanisms              | `Incoming Viewing Key`, `Outgoing Viewing Key`, `Full History Viewing Key`                                                            |
| **Privacy Trust Model**   | Fundamental privacy guarantee                | **Base**: `Cryptographic`, `Threshold (MPC/FHE)`. **Collusion threshold**: m-of-n                                                     |
| **Network Privacy**       | Transport layer metadata protection          | RPC privacy options (`Tor/I2P`, `Oblivious HTTP`, `Mixnet`)                                                                           |

_`_` L2Beat direct match\*

### 3. Security & Governance

| Metric                         | What is Measured                        | Discrete Metrics                                                                                                                                                                       |
| :----------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sequencer Decentralization** | Decentralization of tx ordering         | `Centralized`, `Permissioned Set`, `Decentralized Auction`, `Based (L1 Sequencing)`                                                                                                    |
| **Censorship Resistance**      | Mechanism to bypass censoring sequencer | **Mechanism**: `Force inclusion`, `Escape Hatch`, `Council`. **User burden**: `Stateless`, `Merkle Witness`, `Full State Reconstruction`. **Latency**: `Immediate`, `Challenge Period` |
| **Prover Mechanism**           | Proof generation and verification       | **Access**: `Whitelist`, `Permissionless`. **System**: `Plonk`, `Stark`, `FHE`, `Groth16`                                                                                              |
| **Upgrade Process**            | L1 contract update mechanism            | **Governance**: `Multisig (m-of-n)`, `Immutable`, `DAO Vote`. **Timelock**: delay in days/hours                                                                                        |
| **Client-Side Requirements**   | End-user computational cost             | **Client proving**: `Yes`/`No`. **Features**: `Mobile Proving`, `Trusted Delegation`, `Blind Delegation`. **Benchmark**: proof duration/size/memory for ERC-20 transfer                |
| **Finality Security**          | Validity guarantee type                 | `Validity (ZK)`, `Optimistic (Fraud Proofs)`                                                                                                                                           |
| **Proof System Setup**         | Initial setup requirement               | `Trusted Ceremony`, `Transparent`                                                                                                                                                      |
| **Programmability**            | Developer environment                   | **Language**: `EVM/Solidity`, `DSL`, `WASM`. **Deployment**: `Permissionless`, `Whitelisted`                                                                                           |
| **PQ Security**                | Post-quantum vulnerability              | Susceptible to HNDL attacks? (`Yes`/`No`)                                                                                                                                              |

## Simple Value Transfer

A protocol-native payment where a sender transfers an ERC-20 amount to a single recipient, resulting in a valid state transition.

**TPS<sub>Public</sub>**: Transfer semantics publicly observable. Completion = L2 inclusion + validity.

**TPS<sub>Private</sub>**: Full privacy mode (hiding sender, recipient, amount as applicable). Optional features excluded unless protocol-mandatory.

**Consistency requirement**: Features excluded when reporting TPS must not be implicitly assumed elsewhere.

**Non-goals**: This definition does not equalize DA models, finality, confirmation UX, compliance features, or offchain coordination.

## Guarantees

- Consistent comparison criteria across heterogeneous L2 architectures
- Separation of self-reported vs independently verified metrics
- Clear visibility into what each system hides from whom
- Traceable claims (all metrics require sources)

## Trade-offs

- Self-reported metrics may be optimistic; prefer independent benchmarks
- Some systems may not map cleanly to all criteria
- Metrics change as systems mature; requires periodic re-evaluation
- Does not capture all institutional requirements (legal, operational)

## Targeted Protocols

**Privacy L2s**: Aztec, Miden, Intmax, Prividium, Scroll Cloak, EY Nightfall

## Results (Public Data)

> Metrics below are from public documentation and independent sources. Empty cells indicate data not yet publicly available.

### Deployment Model

| Protocol         | Type         | Description                                                   |
| :--------------- | :----------- | :------------------------------------------------------------ |
| **Aztec**        | Public L2    | Hybrid public/private network with native privacy             |
| **Miden**        | Public L2    | Hybrid public/private network with optional delegated proving |
| **Intmax**       | Public L2    | Stateless public network, client holds data                   |
| **Prividium**    | AppChain SDK | Private Validium on ZKsync Stack for institutional deployment |
| **Scroll Cloak** | AppChain SDK | L3 validium appchain on Scroll/EVM chains                     |
| **EY Nightfall** | AppChain SDK | ZK-Rollup stack for enterprise deployment                     |

_AppChain SDKs have deployment-dependent assumptions (sequencer, DA, governance) that vary by operator._

### Privacy & Architecture Overview

| Protocol         | Type         | Privacy Model      | Proof System       | DA Layer                | Finality |
| :--------------- | :----------- | :----------------- | :----------------- | :---------------------- | :------- |
| **Aztec**        | Public L2    | Cryptographic (ZK) | UltraHonk          | L1 Blobs                | Validity |
| **Miden**        | Public L2    | Cryptographic (ZK) | STARK (Winterfell) | L1 Blobs                | Validity |
| **Intmax**       | Public L2    | Cryptographic (ZK) | Plonk/Gnark        | Stateless (Client-Side) | Validity |
| **Prividium**    | AppChain SDK | Cryptographic (ZK) | Boojum/Plonk       | External (Private DB)   | Validity |
| **Scroll Cloak** | AppChain SDK | Cryptographic (ZK) | Scroll zkEVM       | Host chain              | Validity |
| **EY Nightfall** | AppChain SDK | Cryptographic (ZK) | UltraPlonk         | L1 Call Data            | Validity |

### Privacy Visibility Matrix

| Protocol         |     Balance      |      Sender      |     Receiver     |      Amount      |   Code/Function    |
| :--------------- | :--------------: | :--------------: | :--------------: | :--------------: | :----------------: |
| **Aztec**        | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> |
| **Miden**        | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> | Hybrid<sup>1</sup> |
| **Intmax**       |      Hidden      |      Hidden      |      Hidden      |      Hidden      | Public<sup>2</sup> |
| **Prividium**    |      Hidden      |      Hidden      |      Hidden      |      Hidden      |       Hidden       |
| **Scroll Cloak** |      Hidden      |      Hidden      |      Hidden      |      Hidden      |       Hidden       |
| **EY Nightfall** |      Hidden      |      Hidden      |      Hidden      |      Hidden      |      Limited       |

<sup>1</sup> Both Aztec and Miden let the developer choose to store assets in Public (Account model) or in Private (UTXO note).

<sup>2</sup> The "predicate" (validation logic) is public, but the inputs and balances are stateless/hidden. Intmax only performs value transfers and does not enable sophisticated logic.

### Security & Governance

| Protocol         | Sequencer                   | Censorship Resistance |     Client Proving     | Upgrade Mechanism   |
| :--------------- | :-------------------------- | :-------------------- | :--------------------: | :------------------ |
| **Aztec**        | Decentralized (Ignition)    | Escape Hatch          |      Yes (heavy)       | Multisig            |
| **Miden**        | Operator (Centralized)      | TBD                   | Yes (can be delegated) | Multisig            |
| **Intmax**       | Decentralized (Aggregators) | Force Inclusion       |      Yes (light)       | TBD                 |
| **Prividium**    | Permissioned (Owner)        | Operator-dependent    |      No (server)       | Operator-controlled |
| **Scroll Cloak** | Permissioned (Owner)        | Force Exit to host    |  No (prover service)   | Operator-controlled |
| **EY Nightfall** | TBD                         | TBD                   |          Yes           | TBD                 |

**Client Proving Note**: "Yes (heavy)" = user device generates ZK proof (seconds/minutes). "No (server)" = user signs, server proves (instant UX, higher trust).

### Compliance Features

| Protocol         | Viewing Keys | Selective Disclosure | Audit Support               |
| :--------------- | :----------: | :------------------: | :-------------------------- |
| **Aztec**        |     Yes      |         Yes          | Incoming/Outgoing keys      |
| **Miden**        |     Yes      |         Yes          | Note-based disclosure       |
| **Prividium**    |     TBD      |         TBD          | TBD                         |
| **Scroll Cloak** |     Yes      |    Access control    | Operator + regulator access |
| **EY Nightfall** |     Yes      |         Yes          | Enterprise audit trail      |

_Sources: Protocol documentation, L2Beat, academic papers. Last updated: 2026-01-27_

## Related: Privacy App Layers

The following solutions add privacy to existing chains. They have different architectures than Privacy L2s (no separate L2 state/sequencer) but are valuable for specific use cases:

| Solution              | Type             | Description                                            |
| :-------------------- | :--------------- | :----------------------------------------------------- |
| **Railgun**           | L1 Shielded Pool | Privacy system on Ethereum L1 using shielded transfers |
| **Kaleido (Paladin)** | L1 Privacy Layer | Enterprise privacy layer on Ethereum L1                |
| **Zama fhEVM**        | Coprocessor      | FHE confidentiality layer added to any EVM chain       |

These are included in the [RFP: Living Benchmark Dashboard](../rfps/rfp-benchmark-dashboard.md) for performance benchmarking.

## See Also

- [RFP: Living Benchmark Dashboard](../rfps/rfp-benchmark-dashboard.md) - Automated benchmark pipeline
- [L2Beat](https://l2beat.com/) - Independent L2 risk analysis
- [Pattern: Hybrid Public-Private Modes](pattern-hybrid-public-private-modes.md)
- [Pattern: ZK Shielded Balances](pattern-zk-shielded-balances.md)

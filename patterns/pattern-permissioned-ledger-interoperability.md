---
title: "Pattern: Permissioned Ledger Interoperability"
status: draft
maturity: testnet
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - Multiple financial institutions each operate their own permissioned ledger but require atomic cross-ledger settlement.
  - Regulatory constraints prevent moving all participants onto a single shared chain.

avoid-when:
  - Use cases require fully open participation on public blockchains.
  - Applications depend on composability with EVM or ZK ecosystems.

context: i2i

crops_profile:
  cr: none
  o: no
  p: partial
  s: low

crops_context:
  cr: "Each ledger operator controls participation, so CR is structurally `none` for non-members. Could reach `medium` if validators join permissionlessly via bonding with protocol-enforced exit rights."
  o: "Sync protocols exist as open specifications (e.g., Canton Network) but core implementations are often proprietary or tightly coupled to a vendor stack. Reaches `yes` when the full protocol and reference implementation are published under permissive or copyleft licenses."
  p: "Counterparty-only visibility of transaction payloads between the two transacting domains. Cross-domain messages reveal the existence of interactions. Reaches `full` with end-to-end encryption of cross-domain messages and scoped view keys for regulators."
  s: "Rides on each domain's local consensus and on the sync protocol's commit coordination. Reaches `high` with proven Byzantine consensus liveness under partition and honest-minority thresholds on the sync coordinator."

post_quantum:
  risk: medium
  vector: "Sync protocols rely on classical signatures (ECDSA, EdDSA) for cross-domain attestations. HNDL risk on encrypted cross-domain payloads if stored long-term."
  mitigation: "Migrate cross-domain signing to hash-based or lattice-based schemes; encrypt long-lived payloads with hybrid PQ-secure transport."

visibility:
  counterparty: [amounts, identities, terms]
  chain: []
  regulator: [full_tx with scoped disclosure]
  public: []

standards: [DAML, ISO-20022, EAS, ERC-7573]

related_patterns:
  composes_with: [pattern-dvp-erc7573, pattern-private-iso20022, pattern-crypto-registry-bridge-ewpg-eas]
  alternative_to: [pattern-privacy-l2s]
  see_also: [pattern-regulatory-disclosure-keys-proofs]

open_source_implementations:
  - url: https://github.com/digital-asset/daml
    description: "Digital Asset's DAML smart contract language and Canton runtime"
    language: "Scala, DAML"
  - url: https://github.com/hyperledger/besu
    description: "Enterprise EVM client with permissioned networking and privacy groups"
    language: "Java"
---

## Intent

Enable atomic transactions and data exchange across distinct permissioned ledgers, so that institutions can interoperate without exposing all contract state or migrating to a single ledger. Each domain keeps its own consensus and governance; a coordination protocol synchronizes commits across domains.

## Components

- Permissioned ledger domains, each with its own consensus, identity set, and privacy boundary.
- Synchronization protocol that coordinates commits across domains (two-phase or view-based atomic commit).
- Smart contract language with explicit participant visibility controls, so contract state is replicated only to actual stakeholders.
- Governance model for validator or participant node admission, rotation, and exit.
- Selective disclosure mechanism for supervisors and auditors to access relevant state without full replication.

## Protocol

1. [operator] Deploy applications or contracts on separate permissioned ledgers, one domain per participant group.
2. [contract] Each ledger operates its own local consensus and privacy domain independently.
3. [operator] A synchronization protocol links ledgers for cross-domain transactions, typically via relayers or a coordinator committee.
4. [user] Parties agree off-chain on transaction terms (e.g., bond delivery versus cash payment).
5. [contract] Each domain validates locally, then exchanges commitments or proofs with the counterparty domain.
6. [contract] The sync protocol ensures atomic commit: either all domains finalize or all abort.
7. [regulator] Supervisors access relevant state via scoped disclosure keys or attestations.

## Guarantees & threat model

Guarantees:

- Atomicity: cross-ledger operations settle consistently or abort.
- Counterparty privacy: only transacting parties see payload state; other domains observe only commitment envelopes.
- Regulatory audit: scoped access for supervisory entities via dedicated disclosure paths.

Threat model:

- Honesty of the sync coordinator or relayer set. A malicious coordinator can stall commits but cannot unilaterally fabricate state.
- Each domain's local consensus. A compromised domain can produce inconsistent views to counterparties.
- Operator control over admission. Each ledger operator retains the ability to deny access, freeze assets, or refuse to process transactions within its domain.
- Cross-chain atomicity under partition is out of scope for simple two-phase commit; stronger protocols are needed when domains lose connectivity mid-commit.

## Trade-offs

- Performance: synchronization adds latency versus single-ledger settlement, particularly under two-phase commit.
- Complexity: requires harmonization of governance, participant identity, and protocol versions across domains.
- Interoperability limits: not natively composable with public-chain DeFi or Ethereum L2 tooling.
- Failure modes: a stalled domain halts atomic settlement for any transaction touching it; timeouts and rollback paths must be specified.
- Operator censorship: each ledger operator controls participation within its domain; decentralized validator admission mitigates but does not eliminate this.

## Example

- Bank A issues a bond on Ledger X (its domain).
- Investor B holds cash tokens on Ledger Y (its domain).
- Both ledgers participate in a shared synchronization protocol.
- Transaction: Investor B buys 10m euro of bonds, payment versus delivery.
- Ledger X transfers bond tokens and Ledger Y transfers cash tokens under a single atomic commit.
- Supervisors access the audit trail via scoped disclosure on both domains.

## See also

- [Canton Network overview](https://www.canton.network/)
- [DAML documentation](https://docs.daml.com/)
- [Hyperledger Besu privacy groups](https://besu.hyperledger.org/)

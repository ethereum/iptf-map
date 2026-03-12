---
title: "Pattern: MPC Custody and Transaction Control"
status: draft
maturity: production
layer: offchain
privacy_goal: Protect private keys via threshold distribution; no on-chain privacy of transactions
assumptions: Threshold ECDSA/EdDSA infrastructure, MPC nodes in TEE/HSM, policy engine
last_reviewed: 2026-01-14
works-best-when:
  - Institutions require regulated-grade custody for digital assets
  - Key material must never exist in one place, but transactions must be orchestrated quickly
avoid-when:
  - Use cases demand non-custodial self-sovereign key management
  - Full privacy of transaction metadata is required (MPC does not shield ledger data)
dependencies: [Threshold ECDSA, EdDSA, HSM/KMS]
context: both
crops_profile:
  cr: low
  os: partial
  privacy: none
  security: medium
---

## Intent

Provide secure custody and controlled execution of digital asset transactions by distributing key shares across MPC nodes. Eliminates single points of compromise while enabling policy-based transaction approvals for institutional workflows.

## Ingredients

- Threshold signing algorithms (e.g., threshold ECDSA, EdDSA)
- MPC infrastructure (nodes run in TEEs or HSM-backed environments)
- Orchestration APIs for approval policies and transaction initiation
- Underlying L1/L2 networks (Ethereum, Polygon, permissioned ledgers)
- Optional registry/KYC integration for compliance

## Protocol (concise)

1. Institution defines custody policy (signing quorum, role approvals).
2. Private key is generated in shares across MPC nodes; no single node holds full key.
3. Transaction request initiated via API.
4. Policy engine validates request (limits, whitelists, approvals).
5. MPC nodes run threshold signing protocol to produce valid signature.
6. Transaction broadcast to underlying network.
7. Audit logs and ops signals generated for compliance review.

## Guarantees

- **Key privacy**: private key never reconstructed in a single place.
- **Control**: fine-grained policies enforce who/what can sign.
- **Auditability**: full ops trail for regulatory compliance.
- **Finality**: signature validity guaranteed if quorum threshold met.

## Trade-offs

- **Performance**: threshold signing introduces latency vs. HSM signing.
- **Cost**: requires distributed infra + MPC coordination.
- **Failure modes**: node outage can block signing if quorum not met.
- **Trust assumptions**: relies on vendor’s MPC infrastructure and orchestration.
- **Operator censorship**: MPC operator or policy engine can refuse to co-sign; no unilateral user exit path.
- **CROPS context (both)**: CR could reach `high` if consensus-backed multi-sig with forced exit via L1 timelock is implemented alongside threshold key refresh. OS improves to `yes` by open-sourcing the core MPC signing protocol. Privacy could reach `full` by adding threshold encryption of transactions before policy evaluation. Security could reach `high` by adopting verifiable threshold signing with proactive key refresh. In I2I, forced L1 exit paths ensure institutions can recover assets even if the MPC operator becomes adversarial or insolvent. In I2U, open-source signing protocols let end users verify that custody providers cannot unilaterally access or freeze their assets.

## Example

- Bank A wants to issue a tokenized bond on Ethereum.
- Custody policy: 2-of-3 signing nodes (compliance, operations, treasury).
- Operations desk initiates transfer; compliance approves via dashboard.
- MPC nodes collectively sign without revealing full private key.
- Transaction is broadcast, bond tokens move to investor’s address.

## See also

- Pattern: [TEE-ZK Settlement](../patterns/pattern-tee-zk-settlement.md)
- Pattern: [Private ISO20022](../patterns/pattern-private-iso20022.md)
- Pattern: [DvP ERC-7573](../patterns/pattern-dvp-erc7573.md)

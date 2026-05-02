---
title: "Pattern: co-SNARKs (Collaborative Proving)"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Enable multi-party ZK proving over distributed private inputs without disclosure
assumptions: co-SNARK protocol infrastructure, MPC network coordination, honest majority among proving parties
last_reviewed: 2026-04-27
works-best-when:
  - Multiple parties each hold sensitive data or models, and need to jointly prove compliance, settlement, or state updates without revealing inputs.
avoid-when:
  - A single party can generate the proof without external data.
dependencies:
  - co-SNARK protocols (e.g. TACEO)
context: both
crops_profile:
  cr: medium
  os: yes
  privacy: full
  security: medium
---

## Intent

Enable **collaborative zero-knowledge proving** over distributed private inputs.  
Co-SNARKs let institutions, investors, or service providers jointly prove properties without disclosing raw data, and optionally commit the result as an **onchain state update**.

## Ingredients

- **Cryptography**: co-SNARK ([Collaborative zk-SNARKs](https://eprint.iacr.org/2021/1530.pdf), e.g. TACEO)
- **Infra**: Offchain MPC network, optional L1/L2 onchain commitments
- **Standards**: Can tie into ERC-3643 (identity claims), [attestations](pattern-verifiable-attestation.md), ERC-7573 for settlement

## Protocol (concise)

1. Each participant provides private inputs (e.g. compliance model, investor data, transaction intent).
2. Parties jointly run a co-SNARK protocol to produce a single proof.
3. Proof can be verified by a regulator, counterparty, or onchain contract.
4. Can maintain a **shared private state** in a 3PC setting, committing roots onchain.

## Guarantees

- Prove statements across multiple private data silos without disclosure.
- Preserve trade secrets and client privacy.
- Anchor proofs or state commitments onchain if required.

## Trade-offs

- Heavy communication and coordination overhead (scales with number of parties).
- Requires new infra (MPC nodes, co-prover setup).
- Delegated proving possible, but introduces new trust assumptions.
- Honest-majority assumption: if a majority of proving parties collude, proof integrity is compromised.
- **CROPS context (both)**: CR could reach `high` if economic incentives like bond-backed provers with slashing are added for Byzantine behavior. Security improves to `high` by replacing trusted setup with a universal setup. In I2I settings, multi-party proving typically involves known counterparties with existing legal agreements, so the honest-majority assumption carries lower practical risk. In I2U settings, end-users contributing private inputs face greater exposure if the proving coalition is dominated by institutional actors.
- **Post-quantum exposure**: co-SNARK (Groth16-based) relies on pairings broken by CRQC. Mitigation: co-STARK alternatives. See [Post-Quantum Threats](../domains/post-quantum.md).

## Examples

- **Compliance**: Bank + investor prove AML/KYC checks without sharing raw data.
- **Shared state**: Consortium of custodians maintain a private ledger offchain, publish commitment + co-SNARK consistency proof to L1.
- **Settlement**: Cross-institution cash/asset swap where each side’s balance sheet remains private.

## See also

- TACEO co-SNARK: https://core.taceo.io/articles/mpc-kyc/

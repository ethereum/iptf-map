---
title: "Pattern: Private Shared State (TEE)"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Multiple parties jointly maintain shared state inside hardware enclaves with attestation-verified execution
assumptions: Attested TEE infrastructure (SGX/SEV/Nitro), Ethereum L1/L2 for state-root anchoring, participants accept hardware trust
last_reviewed: 2026-03-11
works-best-when:
  - Multiple institutions share a ledger, pool, or order book and must hide individual positions from each other
  - Low latency is required (TEE execution speed comparable to native)
  - Participants accept hardware trust assumptions with contractual controls
avoid-when:
  - Single-party privacy is sufficient (use shielding instead)
  - Threat model includes nation-state physical access or supply-chain compromise
  - Full trustlessness required (prefer co-SNARKs or FHE alternatives)
dependencies: [TEE platforms (SGX/SEV-SNP/Nitro), attestation infrastructure, Ethereum L1/L2]
context: both
crops_profile:
  cr: low
  os: partial
  privacy: partial
  security: medium
---

## Intent

Enable **N parties to jointly read and write shared on-chain state** (balances, positions, order books, collateral pools) while keeping each party's individual data private from the others. This variant uses **trusted execution environments (TEEs)**: encrypted state is decrypted inside hardware enclaves, computation happens at native speed, and attestation proves correct execution.

Unlike single-party privacy (shielding), private shared state requires computation *across* multiple parties' secrets.

## Ingredients

- **Hardware**: TEE platforms — Intel SGX (process-level enclaves), AMD SEV-SNP (VM-level), or AWS Nitro Enclaves (hypervisor-isolated)
- **Infra**: Attestation verification service; Ethereum L1/L2 for state-root anchoring and settlement finality
- **On-chain**: Commitment schemes (Pedersen, Poseidon) for state representation; optional ZK verifier for TEE+ZK hybrid
- **Off-chain**: Encrypted state blobs; enclave-mediated regulatory access

## Protocol

1. **Setup**: Parties deploy attested TEE cluster; verify enclave measurements and platform configuration.
2. **Deposit**: Parties deposit assets into PSS contract; balances encrypted to enclave public key.
3. **Request**: A party submits an encrypted state transition (transfer, trade, margin call) to the enclave.
4. **Compute**: TEE decrypts inputs, processes the transition at native speed, produces encrypted outputs.
5. **Commit**: State commitment and optional correctness proof posted on-chain.
6. **Audit**: Regulators access scoped disclosure via enclave-mediated decryption.

## Guarantees

- **Input privacy**: Data confidential from other parties and from the host operator (under TEE assumptions). Hardware vendor holds potential access via master keys.
- **State correctness**: Attestation proves code and configuration match expectations. For stronger guarantees, combine with ZK proofs ([TEE+ZK Settlement](pattern-tee-zk-settlement.md)).
- **Settlement finality**: Anchored to Ethereum L1/L2 for irreversibility.
- **Auditability**: Enclave-mediated scoped disclosure for regulators.

## Trade-offs

- Host/operator controls enclave availability; can deny service. Hardware vendor dependency for attestation roots (CR: `low`).
- Privacy depends on TEE integrity; hardware vendor can observe plaintext during execution (privacy: `partial`). Contractual controls (NDA, audit rights) mitigate this in institutional settings.
- Fastest to deploy (pilot maturity); lowest latency of the three PSS variants.
- Enclave code can be open source, but TEE hardware and firmware are proprietary (OS: `partial`).
- Side-channel attacks (cache timing, Spectre) are documented risks; constant-time code and firmware patching mitigate.
- Does not hide sender/receiver addresses by default; combine with [stealth addresses](pattern-stealth-addresses.md) for address unlinkability.
- **Liveness**: TEE depends on the host continuing to schedule the enclave. Degrades to unavailability, not privacy loss, on liveness failure.
- **CROPS context**: Applies to I2I (multi-party institutional computation). In I2U, CR drops further — institution operates the TEE and end-user has no independent verification of enclave integrity, making privacy dependent on institutional trust. Security improves with TEE+ZK combination or threshold keys across multiple independent TEE instances.

## Example

**Consortium Collateral Pool**

- Three banks deposit tokenised bonds into a shared collateral pool on an Ethereum L2.
- Each bank's deposit amount is encrypted to the TEE cluster's public key.
- A margin call triggers enclave computation: the TEE decrypts balances, verifies sufficient aggregate collateral, and produces encrypted results.
- A state commitment is posted on-chain; attestation logs prove correct execution.
- The regulator uses enclave-mediated access to audit one bank's position without learning the others'.

## See also

- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC+ZK alternative (cryptographic trust)
- [Private Shared State (FHE)](pattern-private-shared-state-fhe.md): FHE alternative (cryptographic trust)
- [TEE-Based Privacy](pattern-tee-based-privacy.md): Foundational TEE trust model and failure modes
- [Hybrid TEE + ZK Settlement](pattern-tee-zk-settlement.md): TEE execution with ZK verification for stronger guarantees
- [Shielding](pattern-shielding.md): Single-party UTXO privacy (not shared state)

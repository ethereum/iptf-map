---
title: "Pattern: Hybrid TEE + ZK Settlement"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Private cross-chain settlement in TEEs with ZK proofs attesting correct execution
assumptions: Attested TEE infrastructure, ZK prover backend, attestation registry
last_reviewed: 2026-01-14
works-best-when:
  - Participants accept some trust in TEEs but want zk-based attestations for audit.
  - Privacy requirements exceed what public smart contracts can do alone.
avoid-when:
  - TEE availability or attestation infra is weak/untrusted.
  - Regulators reject opaque enclaves.
dependencies:
  - Attested TEEs (Intel SGX/AMD SEV)
  - ZK proof system for attestation validity
---

## Intent

Coordinate private cross-chain settlement inside TEEs, with zk-proofs attesting to correct execution — hiding counterparties/amounts but proving atomicity.

## Ingredients

- **Standards**: EAS (attestations), ERC-20/3643 assets
- **Infra**: TEEs on relayers, zk-prover backend
- **Off-chain**: Attestation registry, KMS

## Protocol (concise)

1. Parties submit encrypted orders to TEE.
2. TEE executes settlement privately.
3. TEE outputs zk-proof: “Settlement followed protocol, balances match.”
4. Proof verified on-chain; state updates applied.
5. Optional: Audit attestation logged in registry.

## Guarantees

- Strong privacy of state & flow.
- On-chain proof of correct execution.
- Atomicity across networks.

## Trade-offs

- Trust anchor in TEEs (supply chain risk).
- Performance limited by enclave capacity.
- Attestation verification infra needed.

## Example

- Euro stablecoin on Chain A, security token on Chain B.
- TEE matches & settles off-chain, emits zk-proof.
- Both ledgers accept update when proof verifies.

## See also

- pattern-regulatory-disclosure-keys-proofs.md
- pattern-dvp-erc7573.md
- pattern-aztec-privacy-l2-erc7573.md

---
title: "Pattern: Private Client Authentication for Institutional EOAs"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Authenticate client EOAs via Merkle proofs without revealing identity or linking addresses
assumptions: ZK circuits for Merkle membership, on-chain Merkle root registry, Semaphore or similar
last_reviewed: 2026-01-14
works-best-when:
  - Institutions must comply with KYC/AML but want to protect client privacy onchain.
  - Clients need to prove control of EOAs without revealing identity.
  - Multi-address support is desired (same seed, different EOAs).
avoid-when:
  - Regulators require explicit PII disclosure onchain.
  - Institutions lack capacity to manage ZK infrastructure or Merkle registry.
dependencies: [ERC-3643, EIP-7573, EAS, Semaphore, MTP, ZK-Proofs]
---

## Intent

Enable institutions to authenticate client EOAs in a way that satisfies regulatory KYC/AML requirements while preserving privacy. This pattern uses **Merkle tree membership proofs** (e.g., via Semaphore) so clients can demonstrate inclusion in an approved/KYC’d registry without revealing identity or linking other addresses.

## Ingredients

- **Standards/ER(C|IP)s**: ERC-3643 (permissioned tokens), EAS (attestation registry).
- **Infra**: Ethereum L1/L2s, wallet, ZK circuits for Merkle membership proofs.
- **Off-chain services**: KYC registries, institutional Merkle tree builder, key management systems, On-chain contract to maintain MT root.

## Protocol (concise)

1. Client undergoes KYC off-chain with institution or distributor.
2. Institution inserts client EOA into a Merkle tree of approved addresses; commits root onchain.
3. Client wallet generates a **Semaphore proof**: Merkle membership + nullifier (anti-replay) + private key control.
4. Proof submitted to institution’s contract or off-chain verifier.
5. Institution verifies ZK proof; accepts EOA as authenticated.
6. (Future) Clients prove multiple EOAs derive from same seed via multi-ownership extension.
7. Regulators/auditors can verify tree updates and proof validity without learning which leaf belongs to whom.

## Guarantees

- **Hides**: identity, KYC details, linkage between EOAs.
- **Proves**: KYC membership, private key control, non-reusability (via nullifiers).
- **Atomicity**: proof verification and transaction execution tied.
- **Audit**: regulator can validate registry and roots without deanonymizing clients.

## Trade-offs

- **Performance/cost**: ZK proof generation adds latency; tree updates must be frequent.
- **DX**: client wallets need Semaphore/ZK integration.
- **Limitations**: current Semaphore-style MT proofs don’t support efficient multi-ownership (same seed, many EOAs).

## Example

- The bank runs a KYC registry; inserts approved EOAs into a Merkle tree.
- Client generates a Semaphore proof showing inclusion in the tree.
- The bank contract validates the proof before processing a tokenized security transfer.
- Observers see the transaction but cannot link EOA to a specific client or discover other addresses.
- Regulator can later audit the registry root and inclusion proof.

## See also

- [Approach: Private Authentication & Identity Verification](../approaches/approach-private-auth.md)
- [Verifiable Attestation](pattern-verifiable-attestation.md)
- [vOPRF Nullifiers](pattern-voprf-nullifiers.md)
- [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md)
- [ZK-KYC/ML + ONCHAINID](pattern-zk-kyc-ml-id-erc734-735.md)
- [zk-TLS](pattern-zk-tls.md)

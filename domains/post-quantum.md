---
title: "Domain: Post-Quantum Threats"
status: draft
---

## TLDR

- CRQC breaks ECDSA, BLS, ECDH, Groth16, PLONK/KZG — Ethereum consensus, execution, and application privacy layers all affected.
- Harvest Now, Decrypt Later (HNDL) means confidentiality-critical applications face urgency now, even though CRQC is years away.
- Hash-based and lattice-based primitives provide migration paths; STARKs are already PQ-safe.

## PQ Threat Landscape

| Category                  | Assumption / Problem            | Quantum Effect     | Broken?     | Impacted Systems / Notes         |
| ------------------------- | ------------------------------- | ------------------ | ----------- | -------------------------------- |
| **Discrete Log**          | Dlog (ECDLP, finite fields)     | Shor (exponential) | Yes      | ECDSA, EdDSA, DH, DSA            |
| **Factorization**         | Integer factorization           | Shor (exponential) | Yes      | RSA, RSA accumulators            |
| **Diffie-Hellman**        | CDH / DDH                       | via Dlog           | Yes      | TLS, key exchange                |
| **Pairing-based**         | BDH, q-SDH, SXDH                | via Dlog           | Yes      | BLS, Groth16, KZG                |
| **RSA-type variants**     | Strong RSA                      | via factorization  | Yes      | Accumulators, VDFs (RSA-based)   |
| **Hash functions**        | Preimage / collision resistance | Grover / BHT       | Weakened | SHA-256 -> ~128-bit               |
| **Symmetric crypto**      | AES security                    | Grover             | Weakened | AES-128 -> ~64-bit                |
| **MAC / PRF / KDF**       | HMAC, HKDF                      | Grover             | Weakened | Double key sizes                 |
| **Lattice-based**         | LWE, Ring-LWE, SIS              | No known speedup   | No       | Kyber, Dilithium                 |
| **Hash-based signatures** | Merkle / one-time signatures    | Grover (not Shor)  | No       | XMSS, SPHINCS+                   |
| **Code-based**            | Syndrome decoding               | No known speedup   | No       | McEliece                         |
| **Multivariate**          | MQ problem                      | No known speedup   | No       | Some schemes fragile classically |
| **SNARK commitments**     | KZG (pairing-based)             | via Dlog           | Yes      | Ethereum zk stack                |
| **STARKs**                | Hash + FRI                      | Grover (not Shor)  | No       | Post-quantum friendly            |

## Ethereum Layer Analysis

| Layer           | Today (Broken)            | Migration Path                                                                             | Target End State                             |
| --------------- | ------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **Consensus**   | BLS (pairings, Dlog)      | Replace fixed BLS with programmable verification; use hash-based sigs or STARK aggregation (see [Lean Ethereum](../patterns/pattern-lean-ethereum.md), [Lean Roadmap](https://leanroadmap.org/)) | Validators submit **proofs**, not signatures |
| **Execution**   | ECDSA (secp256k1)         | Account abstraction (EIP-8141-style); modular validation (custom sig / ZK checks)          | Account = **verification logic**             |
| **Application** | Groth16, PLONK, KZG, ECDH | Replace pairings & Dlog: STARKs, hash commitments, PQ KEMs                                 | **Hash/STARK-first stack**                   |

## Application-Layer Breakages

HNDL makes privacy migration more urgent than authentication: harvested ciphertexts can never be re-encrypted, while signature forgery is at least partially remediable through emergency coordination. New designs should use PQ key exchange for any confidentiality surface that persists beyond a single session.

Ethereum inherits PQ transport encryption for some surfaces (Go 1.24 ships hybrid PQ TLS by default for HTTPS/JSON-RPC). What it *cannot* inherit is application-layer privacy: on-chain ciphertexts, ECDH-based key derivation, stealth address generation, ZK-proven encryption, and access pattern hiding are blockchain-specific problems with no industry equivalent.

### Anonymity and Unlinkability

| Surface | Broken Primitive | Solution Path | Status | Pattern |
|---------|-----------------|---------------|--------|---------|
| Stealth Addresses | ECDH key exchange | ML-KEM + OMR sidecar (33x ciphertext bloat; [Module-LWE protocol](https://eprint.iacr.org/2025/112) ~66.8% faster scan) | Active research | [Stealth Addresses](../patterns/pattern-stealth-addresses.md) |
| zkTLS | MPC/2PC on ECDH handshake | Co-design MPC with ML-KEM algebraic structure; TLS 1.3 support prerequisite | Unsolved | [zk-TLS](../patterns/pattern-zk-tls.md) |
| zkID (export) | EC-based signatures | Poseidon-internal hash-based PQ sigs + STARK verification on device | Tractable | [ZK KYC/ML ID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md) |
| zkID (import) | NIST PQ sig arithmetization | 131x gap vs Groth16; [EIP-8051](https://eips.ethereum.org/EIPS/eip-8051)/[8052](https://eips.ethereum.org/EIPS/eip-8052) precompiles for direct verification | Open research | [ZK KYC/ML ID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md) |

### Confidentiality

| Surface | Broken Primitive | Solution Path | Status | Pattern |
|---------|-----------------|---------------|--------|---------|
| Note discovery / viewing keys | EC-based key derivation | ML-KEM (outside ZK circuit) + OMR | Tractable | [Shielding](../patterns/pattern-shielding.md), [Noir Private Contracts](../patterns/pattern-noir-private-contracts.md) |
| Proven-correct encryption to auditor | ElGamal (EC scalar mul) | Lattice PKE outside circuit + Poseidon symmetric encryption inside circuit (detect-and-flag model) | Partial | [Regulatory Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md) |
| Protocol-enforced decryptability | Proving lattice PKE in-circuit | Field mismatch (q=3,329 vs BN254); simpler than full ML-KEM but still expensive | Unsolved | — |

### Dependencies

- **Client-side GPU proving**: PQ privacy requires on-device ZK proofs. NTT-based PQ primitives align well with GPU architecture ([100+ Gops/s on mobile GPUs for small fields vs < 1 Gops/s for BN254](https://pse.dev/blog/client-side-gpu-everyday-ef-privacy)).
- **STARK migration**: SNARKs (Groth16, PLONK/KZG) broken; STARKs (hash + FRI) survive. See [ZK Proof Systems](../patterns/pattern-zk-proof-systems.md).

## Affected Patterns

| Pattern | PQ-Broken Primitive | HNDL Risk | Mitigation Path |
|---------|-------------------|-----------|-----------------|
| [Stealth Addresses](../patterns/pattern-stealth-addresses.md) | ECDH (shared secret) | High | ML-KEM + OMR sidecar |
| [PSI-DH](../patterns/pattern-private-set-intersection-dh.md) | DDH / commutative encryption | Medium | Lattice-based PSI |
| [MPC Custody](../patterns/pattern-mpc-custody.md) | Threshold ECDSA/EdDSA | Low | ML-DSA / hash-based threshold |
| [TEE Key Manager](../patterns/pattern-tee-key-manager.md) | ECDSA/BLS signing | Low | PQ signing in TEE |
| [Noir Private Contracts](../patterns/pattern-noir-private-contracts.md) | Barretenberg (PLONK) | High | Hash-based commitments / STARKs |
| [Private Shared State (co-SNARK)](../patterns/pattern-private-shared-state-cosnark.md) | Groth16 | Medium | co-STARK alternatives |
| [TEE+ZK Settlement](../patterns/pattern-tee-zk-settlement.md) | Groth16/PLONK | Medium | STARKs |
| [co-SNARK](../patterns/pattern-co-snark.md) | co-SNARK (Groth16-based) | Medium | co-STARK |
| [Threshold Encrypted Mempool](../patterns/pattern-threshold-encrypted-mempool.md) | Pairing-based threshold encryption | Medium | Lattice-based threshold encryption |
| [Shielding](../patterns/pattern-shielding.md) | ZK proofs (impl-dependent) | High | STARK-based shielded pools |
| [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md) | EC-based OPRF (DDH) | Low | Lattice-based OPRF |
| [Pretrade Privacy](../patterns/pattern-pretrade-privacy-encryption.md) | Threshold encryption | Medium | Lattice-based threshold |
| [zk-TLS](../patterns/pattern-zk-tls.md) | MPC on ECDH key exchange | Medium | MPC/2PC over ML-KEM (unsolved) |
| [ZK KYC/ML ID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md) | Underlying proof system | Medium | STARK-based proving |
| [Origin-Locked Confidential Ledger](../patterns/pattern-origin-locked-confidential-ledger.md) | ElGamal (EC-based) | High | Lattice-based PKE |
| [Safe Proof Delegation](../patterns/pattern-safe-proof-delegation.md) | Recursive ZK (if EC-based) | Medium | STARK-based recursion |

**PQ-safe patterns** (no mitigation needed):
- [Private Shared State (FHE)](../patterns/pattern-private-shared-state-fhe.md) — lattice-based
- [Private MTP Auth](../patterns/pattern-private-mtp-auth.md) — Merkle trees, hash-based
- [Plasma Stateless Privacy](../patterns/pattern-plasma-stateless-privacy.md) — hash-based ZK

## See also

- [Lean Ethereum](../patterns/pattern-lean-ethereum.md) — consensus-layer PQ migration
- [Native Account Abstraction](../patterns/pattern-native-account-abstraction.md) — execution-layer PQ auth agility
- [ZK Proof Systems](../patterns/pattern-zk-proof-systems.md) — STARK vs SNARK PQ comparison
- [Permissionless Spend Auth](../patterns/pattern-permissionless-spend-auth.md) — application-layer auth agility
- [NIST PQC standards](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Ethereum PQ tasklist (ethresear.ch)](https://ethresear.ch/t/tasklist-for-post-quantum-eth/21296)
- [How to hard-fork to save most users' funds in a quantum emergency](https://ethresear.ch/t/how-to-hard-fork-to-save-most-users-funds-in-a-quantum-emergency/18901)

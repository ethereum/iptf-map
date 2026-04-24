---
title: "Pattern: ZK Proof Systems"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Taxonomy of ZK proving systems by trust model, PQ safety, and performance
assumptions: ZK proof system landscape as of 2026
last_reviewed: 2026-03-18
works-best-when:
  - Choosing between proof systems for a new privacy design
  - Evaluating PQ readiness of an existing ZK stack
  - Comparing trust assumptions across proving backends
avoid-when:
  - Application does not use ZK proofs
dependencies: []
context: both
crops_profile:
  cr: medium
  os: yes
  privacy: full
  security: medium
---

## Intent

A zero-knowledge proof is a cryptographic protocol that lets one party prove a statement is true without revealing the inputs. For example, given a function f(x, y) = z, you can prove you know x and y that produce z, without ever disclosing x or y.

This pattern provides a decision framework for selecting ZK proof systems based on trust model, post-quantum safety, proof size, and prover/verifier cost. The core PQ-readiness question for any ZK-based privacy design on Ethereum is whether the underlying commitment scheme relies on elliptic curves (vulnerable) or hash functions or lattices (PQ-safe).

## Ingredients

- **Pairing-based SNARKs**: Groth16, PLONK/KZG — rely on elliptic curve pairings (bilinear maps over BLS12-381 or BN254)
- **EC-based SNARKs**: PLONK/IPA, Halo2 — rely on discrete log over elliptic curves (no pairings, but still EC)
- **Hash-based proof systems**: FRI-based STARKs and hash-based SNARKs (Plonky2/3) — rely on collision-resistant hash functions (Poseidon, Keccak, Blake) without additional cryptographic assumptions. The SNARK/STARK boundary blurs here: systems like Plonky3 use FRI commitments but achieve SNARK-like succinctness
- **Lattice-based SNARKs**: emerging systems (e.g., Latticefold) — rely on lattice hardness assumptions (Module-SIS/LWE), PQ-safe but not yet deployed in production
- **Hybrid systems**: SNARK-wrap-STARK (e.g., prove in STARK, compress proof via SNARK for cheaper on-chain verification)

## Protocol

1. **Statement definition.** Define the computation to be proven (e.g., "I know a preimage", "this state transition is valid", "this credential was verified").
2. **Circuit compilation.** Express the computation as an arithmetic circuit or constraint system (R1CS, PLONKish, AIR).
3. **Setup** (if required). Pairing-based systems require a trusted setup (per-circuit for Groth16, universal for PLONK/KZG). STARKs and IPA-based systems are transparent, no setup.
4. **Proving.** Prover executes computation on private inputs and generates a proof. Cost varies by system, STARKs are more expensive to prove than Groth16.
5. **Verification.** Verifier checks the proof against public inputs. On-chain verification cost is dominated by proof size and verification algorithm complexity.

## Proof System Comparison

| System            | Trust Setup           | PQ-Safe         | Proof Size | Prover Cost | Verifier Cost | Used By                                                                                                |
| ----------------- | --------------------- | --------------- | ---------- | ----------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| Groth16           | Trusted (per-circuit) | No (pairings)   | ~200 B     | Low         | Low           | [Railgun](../vendors/railgun.md), [EY](../vendors/ey.md), [Privacy Pools](../vendors/privacypools.md) |
| PLONK/KZG         | Trusted (universal)   | No (pairings)   | ~400 B     | Medium      | Low           | [Aztec](../vendors/aztec.md), [zkSync](../vendors/zksync.md)                                          |
| PLONK/IPA         | Transparent           | No (EC)         | ~1 KB      | Medium      | Medium        | ZCash                                                                                                  |
| STARKs (FRI)      | Transparent           | Yes (hash-based) | ~50-200 KB | High        | Medium        | [Miden](../vendors/miden.md)                                                                           |
| Hash-based SNARKs | Transparent           | Yes (hash-based) | ~70-250 KB | High        | Medium        | Plonky3, Binius                                                                                        |
| Lattice-based     | Transparent           | Yes (lattices)  | TBD        | TBD         | TBD           | Research stage (Latticefold)                                                                           |

Benchmarks for Ethereum block proving workloads available at [ethproofs.org CSP benchmarks](https://ethproofs.org/csp-benchmarks). Note: the table above reflects typical privacy-application proof characteristics; block-proving benchmarks differ in scale.

### Key dimensions

- **Trust setup**: trusted setups create a toxic waste risk; transparent systems eliminate it. For institutional adoption, transparent is preferred.
- **PQ safety**: pairing-based and EC-based systems are broken by CRQC (Shor's algorithm). Hash-based systems (both STARKs and hash-based SNARKs) and lattice-based systems survive. Hash-based rely on collision resistance, which Grover weakens but does not break. Lattice-based rely on Module-SIS/LWE hardness.
- **Proof size vs verification cost**: pairing-based SNARKs produce tiny proofs (~200-400 B) cheap to verify on-chain. Hash-based systems produce larger proofs (~50-250 KB) but are improving via recursive composition and proof compression.
- **Prover cost**: hash-based systems are more expensive to prove, but NTT-based arithmetic aligns well with GPU acceleration, a key factor for client-side proving.

## Guarantees

- **Completeness (correctness)**: an honest prover with a valid witness always convinces the verifier. If the statement is true and the prover follows the protocol, verification succeeds.
- **Soundness**: all listed systems provide computational soundness, a cheating prover cannot convince the verifier except with negligible probability.
- **Zero-knowledge**: all systems hide the prover's private inputs from the verifier.
- **PQ safety (hash-based and lattice-based)**: hash-based proof systems (STARKs, hash-based SNARKs) and lattice-based systems remain sound against quantum adversaries. Pairing/EC-based SNARKs do not.
- **Transparency (STARKs, IPA, hash-based SNARKs)**: no trusted party or ceremony required.

## Trade-offs

- **PQ migration cost**: existing circuits (Groth16/PLONK) must be re-implemented for hash-based or lattice-based backends, different constraint systems (R1CS vs AIR), different field arithmetic.
- **Proof size on-chain**: hash-based proofs are 100-1000x larger than Groth16 proofs. EIP-4844 blob DA helps, but on-chain verification remains more expensive.
- **Hybrid complexity**: SNARK-wrap-STARK achieves small on-chain proofs but reintroduces pairing assumptions in the wrapper, defeating PQ safety.
- **Ecosystem maturity**: Groth16/PLONK tooling (Circom, Noir, Halo2) is more mature than STARK tooling, though the gap is closing.
- **CROPS context**: Security is `medium` because most deployed privacy systems still use pairing-based SNARKs. Reaches `high` once PQ migration is complete across the privacy stack.

## Example

- A privacy L2 uses PLONK/KZG for transaction proofs today. To prepare for PQ, they evaluate migrating to a FRI-based STARK backend: proof size increases from ~400 B to ~100 KB, but proofs are PQ-safe and require no trusted setup. They use recursive STARK composition to keep on-chain verification cost manageable, and leverage EIP-4844 blobs for proof Data Availability.

## See also

- [Post-Quantum Threats](../domains/post-quantum.md) — why SNARK-to-STARK migration matters
- [Private Contract DSL](pattern-private-contract-dsl.md) — PLONK-based ZK (PQ-vulnerable)
- [Shielding](pattern-shielding.md) — proof system choice affects shielded pool PQ safety
- [Plasma Stateless Privacy](pattern-plasma-stateless-privacy.md) — hash-based ZK (PQ-safe)

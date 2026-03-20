---
title: "Pattern: Private Set Intersection (OPRF-based)"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Two parties discover shared set elements without revealing non-matching entries, scaling to millions of elements
assumptions: Bilateral communication channel, OT hardness, sets contain exact-match identifiers
last_reviewed: 2026-03-18
works-best-when:
  - Sets are large (10k to millions of elements)
  - Bandwidth is constrained (cuckoo hashing compresses communication)
  - Elements are exact-match identifiers (addresses, LEIs, wallet hashes)
avoid-when:
  - Sets are very small (DH-based variant is simpler and sufficient)
  - Need to compute aggregates over the intersection (use circuit-based variant)
  - Fuzzy or approximate matching is required
dependencies: [OPRF (RFC 9497), OT extensions, cuckoo hashing]
context: both
crops_profile:
  cr: high
  os: yes
  privacy: full
  security: medium
---

## Intent

Two parties each hold a private set of identifiers and want to learn which elements they share without exposing the rest. This variant uses Oblivious Pseudorandom Functions (OPRFs) built on Oblivious Transfer extensions. Each party acts as the OPRF evaluator for the other's inputs, producing pseudorandom tags that match only when the underlying elements match. Cuckoo hashing compresses communication to O(n + m) with small constants. The protocol scales to millions of elements where the DH-based variant becomes impractical.

## Ingredients

- **Cryptography**: OPRF (RFC 9497), OT extensions (IKNP or Silent OT), cuckoo hashing
- **Infra**: Authenticated bilateral channel (TLS, Noise, or similar)
- **Off-chain**: Ephemeral computation, no persistent infrastructure required

## Protocol

1. **Agree**: Parties A and B fix OPRF parameters, hash functions for cuckoo hashing, and a shared PRF output length.
2. **Hash**: Each party inserts its elements into a cuckoo hash table with k hash functions, producing fixed-size tables T_A and T_B.
3. **OPRF (A evaluates for B)**: A acts as the OPRF key holder with secret key k_A. B sends its table entries through an OT-based OPRF protocol. B receives PRF(k_A, y) for each y in T_B without A learning any y values.
4. **OPRF (B evaluates for A)**: B acts as the OPRF key holder with secret key k_B. A sends its table entries through the same OPRF protocol. A receives PRF(k_B, x) for each x in T_A without B learning any x values.
5. **Tag exchange**: A computes PRF(k_A, x) for its own elements and sends these tags to B. B computes PRF(k_B, y) for its own elements and sends these tags to A.
6. **Match**: Each party compares the tags it computed in the OPRF step against the tags received from the other party. Equal tags identify the intersection.
7. **Output**: Each party maps matched tags back to its own plaintext elements. Non-matching elements are hidden behind the other party's OPRF key.

## Guarantees

- **Input privacy**: Non-intersecting elements are computationally hidden under OT hardness. The OPRF ensures the evaluator learns just the PRF outputs.
- **Bilateral**: Runs directly between two parties over an authenticated channel.
- **Completeness**: All shared elements are found, assuming cuckoo hashing insertion succeeds (negligible failure probability).
- **Soundness**: Zero false positives (PRF collision probability is negligible).
- **Scalability**: O(n + m) communication with small constants. Handles large sets (millions of elements) efficiently.
- **I2I**: Custodians reconcile flagged-address lists, banks deduplicate client portfolios, or counterparties match large order books.
- **I2U**: A user checks a large eligibility list without the institution learning the user's other identifiers.

## Trade-offs

- More complex to implement than the DH-based variant. Requires OT extension libraries and cuckoo hashing.
- O(n + m) communication, but with larger per-element constants than DH-based due to OT base setup. Amortizes well as set sizes grow.
- Semi-honest security by default. Malicious security requires a committed OPRF, which adds a zero-knowledge proof per element and roughly doubles computation.
- Cuckoo hashing introduces a small failure probability (element insertion fails). Stash slots or larger tables mitigate this at minor cost.
- Privacy degrades if a party submits a singleton set (reveals whether that element is in the other's set). Mitigate with a minimum set-size policy.
- **CROPS context**: Applies to both I2I and I2U. CR is `high` because both parties run the protocol directly without an intermediary that could censor or filter matches. In I2I, institutions execute the protocol bilaterally over an authenticated channel, with set sizes in the hundreds of thousands or millions. In I2U, the user runs their side independently on commodity hardware. Privacy degrades from `full` to `partial` if either party submits a very small set, since intersection membership becomes attributable to specific elements.

## Example

- Custodian A holds 500k wallet addresses flagged for compliance review.
- Custodian B holds 400k wallet addresses flagged under a different jurisdiction's rules.
- Both run OPRF-PSI bilaterally.
- They discover 8,200 addresses appearing on both flagged lists.
- The remaining 491,800 and 391,800 non-overlapping addresses are not disclosed.
- Matched addresses feed into a joint investigation workflow.

## See also

- [Private Set Intersection (DH-based)](pattern-private-set-intersection-dh.md): simpler variant for smaller sets (under 10k elements)
- [Private Set Intersection (Circuit-based)](pattern-private-set-intersection-circuit.md): garbled circuit variant for computing functions over intersections
- [Private Set Intersection (FHE-based)](pattern-private-set-intersection-fhe.md): FHE variant for asymmetric set sizes with post-quantum security
- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC for ongoing shared state, vs one-shot matching here
- [VOPRF Nullifiers](pattern-voprf-nullifiers.md): OPRF as a building block for unlinkable nullifier generation
- [DvP (ERC-7573)](pattern-dvp-erc7573.md): downstream consumer, matched trade to settlement
- [Pre-trade Privacy Encryption](pattern-pretrade-privacy-encryption.md): alternative approach for pre-trade discovery
- [MPC Custody](pattern-mpc-custody.md): shares the MPC trust model family
- [Microsoft APSI](https://github.com/microsoft/APSI): asymmetric PSI library supporting labeled and unlabeled modes with unbalanced set sizes
- [OpenMined PSI](https://github.com/OpenMined/PSI): PSI cardinality protocol based on ECDH and Bloom Filters, available in C++, Go, and Rust
- [Encrypto Group PSI](https://github.com/encryptogroup/PSI): benchmarking suite for multiple PSI protocol variants including OT-based
- [libOTe](https://github.com/osu-crypto/libOTe): OT extension library underpinning many OPRF-PSI implementations
- [Kolesnikov et al. 2016](https://eprint.iacr.org/2016/799): foundational paper on efficient batched OPRF for PSI
- [Pinkas et al. 2019](https://eprint.iacr.org/2019/241): circuit-PSI and OPRF-PSI with linear communication

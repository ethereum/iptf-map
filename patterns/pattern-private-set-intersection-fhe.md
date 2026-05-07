---
title: "Pattern: Private Set Intersection (FHE-based)"
status: draft
maturity: testnet
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - Set sizes are asymmetric (one party holds a much larger set than the other).
  - Minimal round count matters (1 to 2 rounds per direction).
  - Post-quantum security from lattice assumptions is preferred.
  - Labelled PSI is needed (return associated metadata for matched items).
avoid-when:
  - Both sets are large and comparable in size (ciphertext expansion makes communication costly).
  - Low-latency matching is critical (homomorphic evaluation is compute-intensive).
  - Simple equality intersection on small sets suffices (the DH-based variant is simpler).

context: both
context_differentiation:
  i2i: "Between institutions, either side can act as receiver by generating the key pair and encrypting its smaller set. Roles are typically negotiated bilaterally based on set sizes and compute capacity. Both institutions can re-run the protocol with roles reversed to learn the intersection symmetrically."
  i2u: "For users, the user acts as receiver and decrypts on commodity hardware. The institution bears the heavier homomorphic evaluation cost. The user learns which of their own elements match; the institution learns nothing about non-matching user elements."

crops_profile:
  cr: high
  o: yes
  p: full
  s: medium

crops_context:
  cr: "The receiver holds the decryption key and runs the protocol directly, with no intermediary controlling match results. No on-chain component is required, so chain-level censorship does not apply."
  o: "Open-source homomorphic-encryption libraries and FHE-based PSI toolkits are available. Parameter selection and security-level calibration are publishable and reproducible."
  p: "The sender sees only ciphertexts. The receiver learns which of their own elements match, not the sender's full set. Masking of non-matching positions prevents side-channel leakage through non-match values."
  s: "Semi-honest by default. Malicious security requires zero-knowledge proofs over the sender's polynomial evaluation. Underlying LWE and RLWE assumptions provide post-quantum resistance."

post_quantum:
  risk: low
  vector: "LWE and RLWE are the main post-quantum candidates for lattice cryptography; no known CRQC attack beats current lattice reductions. Transport and authentication around the protocol still use classical primitives that need PQ migration separately."
  mitigation: "Keep LWE/RLWE parameters aligned with NIST post-quantum guidance and migrate channel authentication to PQ signatures. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  alternative_to: [pattern-private-set-intersection-dh, pattern-private-set-intersection-oprf, pattern-private-set-intersection-circuit]
  composes_with: [pattern-dvp-erc7573, pattern-pretrade-privacy-encryption]
  see_also: [pattern-private-shared-state-fhe, pattern-private-shared-state-cosnark, pattern-mpc-custody]

open_source_implementations:
  - url: https://github.com/microsoft/APSI
    description: "Microsoft APSI: Asymmetric PSI library using homomorphic encryption, supports labelled PSI and sender payloads"
    language: "C++"
  - url: https://github.com/microsoft/SEAL
    description: "Microsoft SEAL: BFV/BGV homomorphic encryption library used by APSI"
    language: "C++"
  - url: https://github.com/zama-ai/tfhe-rs
    description: "Zama TFHE-rs: FHE library in Rust suitable for building custom FHE-PSI protocols"
    language: "Rust"
---

## Intent

Two parties want to learn which elements they share without exposing non-matching entries. This variant uses Fully Homomorphic Encryption: the receiver encrypts their set under an FHE scheme and sends the ciphertexts; the sender homomorphically evaluates a matching polynomial against its own plaintext set and returns masked encrypted results; the receiver decrypts to learn the intersection. The construction suits asymmetric set sizes, minimises round count, and reduces to LWE/RLWE hardness for post-quantum security.

## Components

- FHE scheme (BFV or BGV) with SIMD/batching encoding so multiple plaintexts pack into one ciphertext.
- Receiver's public and secret key pair, freshly generated per session.
- Authenticated channel for ciphertext transport in both directions.
- Sender-side matching polynomial construction, homomorphic evaluation, and randomised masking of result ciphertexts.
- Optional labelled-PSI extension that attaches encrypted payloads to matched items so the receiver also recovers associated metadata.

## Protocol

1. [counterparty] Parties agree on FHE parameters (scheme, polynomial modulus, plaintext modulus). The receiver generates a public and secret key pair.
2. [counterparty] The receiver encodes its m elements into FHE ciphertexts and sends them to the sender along with the public key.
3. [counterparty] The sender constructs a matching polynomial from its n elements and homomorphically evaluates it over each encrypted receiver element. The result encrypts zero for matches and a deterministic non-zero value otherwise.
4. [counterparty] The sender multiplies each result ciphertext by a fresh random non-zero scalar, ensuring non-matches decrypt to uniformly random values.
5. [counterparty] The sender returns the masked encrypted result vector to the receiver.
6. [counterparty] The receiver decrypts. Zeros indicate intersection members; all other values indicate non-matches.
7. [counterparty] Optional symmetric round: the parties repeat steps 1 to 6 with reversed roles so the sender also learns the intersection.

## Guarantees & threat model

Guarantees:

- Input privacy: the sender sees only ciphertexts, the receiver learns matches on its own elements only.
- Post-quantum security at the cryptographic layer: reduces to LWE and RLWE, which resist known quantum attacks.
- Completeness: all shared elements are surfaced at the receiver's side (minimal false negatives).
- Soundness: randomised masking on the sender side keeps false positives negligible.

Threat model:

- LWE and RLWE hardness at the chosen parameters, with parameter selection tracking post-quantum guidance.
- Honest key generation by the receiver and honest polynomial construction and masking by the sender.
- Authenticated transport around the ciphertext exchange; classical authentication layers still need separate PQ migration.
- Out of scope: statistical leakage from repeated sessions if the receiver reuses identical inputs without rerandomising.

## Trade-offs

- Ciphertext expansion is significant (orders of magnitude larger than plaintext). Communication scales with the receiver's set size, so the receiver should hold the smaller set.
- Homomorphic polynomial evaluation is compute-intensive on the sender side; cost is roughly O(m * sqrt(n)) FHE multiplications.
- SIMD batching is essential for practical performance.
- The base protocol reveals the intersection only to the receiver. A bilateral result requires a second round with reversed roles, doubling communication and compute.
- Semi-honest by default; malicious security requires zero-knowledge proofs over the sender's polynomial evaluation.

## Example

A regulator holds a watchlist of 10k entities and a bank holds 2M client account identifiers. The regulator acts as receiver and encrypts its 10k identifiers, sending the ciphertexts to the bank. The bank homomorphically evaluates the matching polynomial over the 10k encrypted identifiers against its 2M accounts and returns masked encrypted results. The regulator decrypts and discovers 47 of its watchlist entities appear among the bank's clients. The bank learns nothing about the remaining 9,953 watchlist entries. To learn which clients matched, the parties run a symmetric round with reversed roles.

## See also

- [Chen, Laine, Rindal 2017: Fast Private Set Intersection from Homomorphic Encryption](https://eprint.iacr.org/2017/299)
- [Cong et al. 2021: Labeled PSI from Homomorphic Encryption with Reduced Computation and Communication](https://eprint.iacr.org/2021/1116)
- [NIST Post-Quantum Cryptography programme](https://csrc.nist.gov/projects/post-quantum-cryptography)

---
title: "Pattern: Private Set Intersection (FHE-based)"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Two parties discover shared set elements using Fully Homomorphic Encryption, suited to asymmetric set sizes
assumptions: One party runs FHE encryption/decryption, the other evaluates a matching function homomorphically, LWE/RLWE hardness
last_reviewed: 2026-03-18
works-best-when:
  - Set sizes are asymmetric (one party holds a much larger set than the other)
  - Minimal round count is critical (1-2 rounds; GC is also constant-round at 3-5)
  - Post-quantum security from lattice assumptions is preferred (GC can also be PQ via PQ-secure OT)
  - Labeled PSI is needed (return associated metadata for matched items)
avoid-when:
  - Both sets are large and comparable in size (ciphertext expansion makes communication costly)
  - Low-latency matching is needed (FHE evaluation is compute-intensive)
  - Simple equality intersection on small sets suffices (DH-based variant is simpler)
dependencies: [BFV/BGV FHE scheme, polynomial evaluation, batching/SIMD encoding]
context: both
crops_profile:
  cr: high
  os: yes
  privacy: full
  security: medium
---

## Intent

Two parties want to learn which elements they share without exposing non-matching entries. This variant uses Fully Homomorphic Encryption: one party (the receiver) encrypts their set under an FHE scheme and sends ciphertexts. The other party (the sender) homomorphically evaluates a matching function against their own plaintext set and returns encrypted results. The receiver decrypts to learn the intersection. For the sender to also learn results, the parties reverse roles and run a second round. FHE-based PSI suits asymmetric settings where one party holds a much larger set, and the low round count (1-2 rounds per direction) minimizes network latency.

## Ingredients

- **Cryptography**: BFV or BGV FHE scheme, polynomial evaluation for membership testing, SIMD/batching encoding
- **Infra**: Authenticated channel (TLS, Noise, or similar)
- **Off-chain**: Ephemeral computation. Sender bears the heavier compute load; receiver performs encryption and decryption.

## Protocol

1. **Setup**: Parties agree on FHE parameters (scheme, polynomial modulus, plaintext modulus). The receiver generates a public/secret key pair.
2. **Encrypt**: The receiver encodes their m elements into FHE ciphertexts, sends them to the sender along with the public key.
3. **Evaluate**: The sender constructs a matching polynomial from their n elements and homomorphically evaluates it over each encrypted receiver element. The result encrypts zero for matches, a deterministic nonzero value otherwise.
4. **Mask**: The sender multiplies each result ciphertext by a fresh random nonzero scalar, ensuring non-matches decrypt to uniformly random values.
5. **Return**: The sender sends the masked encrypted result vector to the receiver.
6. **Decrypt**: The receiver decrypts. Zeros indicate intersection members; all other values indicate non-matches.
7. **Symmetric round** (optional): To let the sender also learn the intersection, the parties repeat steps 1-6 with reversed roles.

## Guarantees

- **Input privacy**: The sender sees FHE ciphertexts. The receiver learns which of their own elements match, not the sender's full set.
- **Post-quantum security**: Security reduces to LWE/RLWE, believed resistant to quantum attacks.
- **Completeness**: All shared elements are found (minimal false negatives).
- **Soundness**: Randomized masking in step 4 prevents false positives.
- **I2I**: A regulator screens an institution's client list against a watchlist without the institution revealing non-matching clients.
- **I2U**: A user checks whether their identifiers appear on an institutional eligibility list without revealing their full set.

## Trade-offs

- Ciphertext expansion is significant (orders of magnitude larger than plaintext). Communication cost scales with receiver set size, so the receiver should hold the smaller set.
- Homomorphic polynomial evaluation is compute-intensive on the sender side. Cost is roughly O(m * sqrt(n)) FHE multiplications.
- SIMD batching (packing multiple plaintexts per ciphertext) is essential for practical performance.
- The base protocol reveals the intersection to the receiver. A bilateral result requires a second round (step 7), doubling communication and compute.
- Labeled PSI extension: the sender attaches encrypted payloads to matched items, so the receiver decrypts both match status and associated metadata.
- Semi-honest security by default. Malicious security requires ZK proofs over the sender's polynomial evaluation.
- **CROPS context**: Applies to both I2I and I2U. CR is `high` because the receiver holds the decryption key and runs the protocol directly, with no intermediary controlling match results. In I2I, both institutions can initiate a round as receiver. In I2U, the user acts as receiver and decrypts on commodity hardware; the institution acts as sender and bears the heavier FHE evaluation cost. Security is `medium` (semi-honest by default); lattice-based assumptions (LWE/RLWE) provide post-quantum resistance.

## Example

- A regulator holds a watchlist of 10k entities.
- A bank holds 2M client account identifiers.
- The regulator (receiver) encrypts its 10k identifiers under BFV and sends ciphertexts to the bank.
- The bank (sender) homomorphically evaluates the matching polynomial over the 10k encrypted identifiers against its 2M accounts.
- The bank returns masked encrypted results.
- The regulator decrypts and discovers 47 of its watchlist entities appear among the bank's clients.
- The bank learns nothing about the remaining 9,953 watchlist entries. To learn which clients matched, the parties run a symmetric round with reversed roles.

## See also

- [Private Set Intersection (DH-based)](pattern-private-set-intersection-dh.md): symmetric-set variant using ECDH, simpler for small comparable sets
- [Private Shared State (FHE)](pattern-private-shared-state-fhe.md): FHE for ongoing shared state computation, vs one-shot matching here
- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC+ZK for ongoing shared state
- [Private Set Intersection (OPRF-based)](pattern-private-set-intersection-oprf.md): OT/OPRF variant for large symmetric sets
- [Private Set Intersection (Circuit-based)](pattern-private-set-intersection-circuit.md): garbled circuit variant for computing functions over intersections
- [DvP (ERC-7573)](pattern-dvp-erc7573.md): downstream consumer, matched trade to settlement
- [Pre-trade Privacy Encryption](pattern-pretrade-privacy-encryption.md): alternative approach for pre-trade discovery
- [Microsoft APSI](https://github.com/microsoft/APSI): Asymmetric PSI library using FHE (built on Microsoft SEAL), supports labeled PSI and sender payloads
- [Microsoft SEAL](https://github.com/microsoft/SEAL): Underlying BFV/BGV homomorphic encryption library used by APSI
- [TFHE-rs](https://github.com/zama-ai/tfhe-rs): Zama's FHE library in Rust, suitable for building custom FHE-PSI protocols

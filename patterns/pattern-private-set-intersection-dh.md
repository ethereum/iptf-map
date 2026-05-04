---
title: "Pattern: Private Set Intersection (DH-based)"
status: draft
maturity: testnet
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - Both parties hold private sets of comparable size (under 10k elements).
  - Matching is bilateral (exactly two parties).
  - Elements are exact-match identifiers (addresses, ISINs, LEIs).
avoid-when:
  - More than two parties need to participate.
  - Fuzzy or approximate matching is required.
  - One party's set is already public (use a Merkle inclusion proof instead).

context: both
context_differentiation:
  i2i: "Between institutions, both parties run the protocol bilaterally over an authenticated channel. Minimum-set-size policies are negotiated up front. Semi-honest security is usually sufficient when both parties have legal recourse; malicious security can be added when the relationship is less established."
  i2u: "For end users, the user runs their side on commodity hardware. The institution cannot learn the user's other identifiers beyond the submitted set. Users should submit sets larger than the minimum-set-size threshold to avoid turning the protocol into a yes/no membership oracle for a single identifier."

crops_profile:
  cr: high
  o: yes
  p: full
  s: high

crops_context:
  cr: "Both parties run the protocol directly without an intermediary that could censor or filter matches. No on-chain component is required, so chain-level censorship does not apply."
  o: "Open-source implementations exist across multiple languages and the underlying primitives (ECDH, hash-to-curve) are standard."
  p: "Non-intersecting elements are computationally hidden under DDH. Privacy degrades from `full` to `partial` when a party submits a very small set, because intersection membership becomes attributable to specific elements."
  s: "Semi-honest by default. Malicious security requires additional commitments and zero-knowledge proofs binding the blinded set to a committed set."

post_quantum:
  risk: high
  vector: "DDH is broken by Shor's algorithm on a CRQC; commutative ECDH blinding no longer hides non-intersecting elements. HNDL applies to recorded exchanges."
  mitigation: "Migrate to lattice-based or isogeny-based PSI constructions. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  alternative_to: [pattern-private-set-intersection-oprf, pattern-private-set-intersection-circuit, pattern-private-set-intersection-fhe]
  composes_with: [pattern-dvp-erc7573, pattern-pretrade-privacy-encryption]
  see_also: [pattern-voprf-nullifiers, pattern-mpc-custody, pattern-private-shared-state-cosnark]

open_source_implementations:
  - url: https://github.com/google/private-join-and-compute
    description: "Google Private Join and Compute: ECDH-PSI plus homomorphic encryption for aggregate computation over intersections"
    language: "C++"
  - url: https://github.com/OpenMined/PSI
    description: "OpenMined PSI: ECDH-PSI with Bloom filters, bindings for C++, Python, Go, and JavaScript"
    language: "C++"
  - url: https://github.com/encryptogroup/PSI
    description: "Encrypto Group PSI: benchmarking implementations of multiple PSI protocol variants including ECDH"
    language: "C++"
---

## Intent

Two parties each hold a private set of identifiers and want to learn which elements they share without exposing the rest. This variant uses commutative encryption via elliptic-curve Diffie-Hellman: both parties blind their inputs with secret scalars, and the commutativity of scalar multiplication lets them compare double-blinded values without revealing the originals. The protocol runs bilaterally between the two parties.

## Components

- Elliptic curve and hash-to-curve function, agreed by both parties at session setup.
- Ephemeral secret scalars, one per party, freshly sampled per session.
- Authenticated bilateral channel for exchanging blinded and double-blinded sets.
- Local matcher that compares double-blinded points and maps matches back to plaintext on each side.

## Protocol

1. [counterparty] Parties A and B fix the curve and hash-to-curve function and each sample an ephemeral secret scalar (a for A, b for B).
2. [counterparty] A hashes each element to a curve point and multiplies by a, sending the blinded set to B. B does the same with scalar b, sending its blinded set to A.
3. [counterparty] B multiplies A's blinded set by b and returns the double-blinded points. A does the same with B's blinded set and returns them.
4. [counterparty] Each party now holds both double-blinded sets and locally compares points. Equal points identify the intersection.
5. [counterparty] Each party maps matched points back to its own plaintext elements. Non-matching elements stay hidden behind the other party's scalar.

## Guarantees & threat model

Guarantees:

- Input privacy: non-intersecting elements are computationally hidden under DDH.
- Bilateral: runs directly between the two parties without a server or operator.
- Completeness: all shared elements are found (zero false negatives).
- Soundness: negligible false-positive rate under a collision-resistant hash-to-curve.

Threat model:

- DDH hardness on the chosen curve.
- Honest execution by both parties. A malicious party can craft blinded sets that do not correspond to a committed input; mitigate with commit-and-prove variants.
- Authenticated transport between the parties; otherwise a network attacker can swap blinded sets.
- Set-size hygiene: a singleton or near-singleton set turns the protocol into a yes/no oracle on that element. Enforce a minimum-set-size policy.

## Trade-offs

- O(n + m) curve points exchanged. Practical for sets under 10k; for larger sets, use an OT/OPRF-based variant.
- 2(n + m) scalar multiplications. Seconds for 10k elements on commodity hardware.
- Equality-only: aggregates over the intersection require a circuit-based variant.
- Limited to two parties: for more than two, use an MPC-based variant.

## Example

Bank A holds 500 ISINs it wants to buy and Bank B holds 300 ISINs it wants to sell. Both run the bilateral ECDH intersection protocol. They discover 12 ISINs overlap as potential trades; the remaining 488 and 288 non-overlapping identifiers stay hidden from the counterparty. The 12 matched ISINs feed into an ERC-7573 DvP flow for execution.

## See also

- [RFC 9497: Oblivious Pseudorandom Functions (OPRFs) using Prime-Order Groups](https://datatracker.ietf.org/doc/rfc9497/)
- [Meadows 1986: A more efficient cryptographic matchmaking protocol for use in the absence of a continuously available third party](https://ieeexplore.ieee.org/document/6234898): early treatment of the DH-based intersection construction

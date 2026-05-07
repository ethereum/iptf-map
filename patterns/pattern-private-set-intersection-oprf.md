---
title: "Pattern: Private Set Intersection (OPRF-based)"
status: draft
maturity: testnet
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - Sets are large (10k to millions of elements).
  - Bandwidth is constrained (cuckoo hashing compresses communication).
  - Elements are exact-match identifiers (addresses, LEIs, wallet hashes).
avoid-when:
  - Sets are very small (the DH-based variant is simpler and sufficient).
  - Aggregates over the intersection are required (use the circuit-based variant).
  - Fuzzy or approximate matching is required.

context: both
context_differentiation:
  i2i: "Between institutions, the protocol runs bilaterally over an authenticated channel with set sizes in the hundreds of thousands or millions. Parties pre-negotiate OPRF parameters and cuckoo-hash sizing, and typically wrap the protocol in legal agreements covering fair play."
  i2u: "For end users, the user runs their side on commodity hardware. Minimum-set-size policies prevent the institution from turning the protocol into a yes/no oracle for a single user-submitted identifier. The user should only submit sets they can stand behind committing to in bulk."

crops_profile:
  cr: high
  o: yes
  p: full
  s: medium

crops_context:
  cr: "Both parties run the protocol directly without an intermediary that could censor or filter matches. No on-chain component is required, so chain-level censorship does not apply."
  o: "Open-source implementations exist across several languages; underlying OT extensions and cuckoo-hashing routines are standard."
  p: "Non-intersecting elements are computationally hidden under OT hardness. Privacy degrades from `full` to `partial` when a party submits a very small set, because intersection membership becomes attributable to specific elements."
  s: "Semi-honest by default. Malicious security requires a committed OPRF with a zero-knowledge proof per element, roughly doubling computation."

post_quantum:
  risk: medium
  vector: "Base OT in standard OT-extension pipelines uses elliptic-curve primitives broken by a CRQC. OPRF evaluation itself is pseudorandom and resists quantum analysis once base OT is secure."
  mitigation: "Swap base OT for a lattice-based or code-based post-quantum OT construction; the OT-extension layer and cuckoo hashing carry over unchanged. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  alternative_to: [pattern-private-set-intersection-dh, pattern-private-set-intersection-circuit, pattern-private-set-intersection-fhe]
  composes_with: [pattern-dvp-erc7573, pattern-pretrade-privacy-encryption]
  see_also: [pattern-voprf-nullifiers, pattern-mpc-custody, pattern-private-shared-state-cosnark]

open_source_implementations:
  - url: https://github.com/microsoft/APSI
    description: "Microsoft APSI: asymmetric PSI library supporting labeled and unlabeled modes with unbalanced set sizes"
    language: "C++"
  - url: https://github.com/OpenMined/PSI
    description: "OpenMined PSI: cardinality protocol based on ECDH and Bloom filters, with bindings for several languages"
    language: "C++"
  - url: https://github.com/encryptogroup/PSI
    description: "Encrypto Group PSI: benchmarking suite for multiple PSI protocol variants including OT-based"
    language: "C++"
  - url: https://github.com/osu-crypto/libOTe
    description: "libOTe: OT extension library underpinning many OPRF-PSI implementations"
    language: "C++"
---

## Intent

Two parties each hold a private set of identifiers and want to learn which elements they share without exposing the rest. This variant uses Oblivious Pseudorandom Functions built on OT extensions: each party acts as the OPRF evaluator for the other's inputs, producing pseudorandom tags that match only when the underlying elements match. Cuckoo hashing compresses communication to O(n + m) with small constants, so the protocol scales to millions of elements where the DH-based variant becomes impractical.

## Components

- OPRF construction (RFC 9497 or batched-OPRF) and an OT extension library (IKNP, Silent OT, or similar).
- Cuckoo hash tables with an agreed number of hash functions and stash slots, used by both parties to pack their inputs.
- Authenticated bilateral channel for OT base setup, OPRF evaluation, and tag exchange.
- Local matcher on each side that compares received OPRF tags against locally-computed tags to surface the intersection.

## Protocol

1. [counterparty] Parties A and B agree OPRF parameters, cuckoo-hash functions, and tag length.
2. [counterparty] Each party inserts its elements into a cuckoo hash table, producing fixed-size tables.
3. [counterparty] A holds OPRF key k_A; B sends its table entries through an OT-based OPRF protocol and receives PRF(k_A, y) for each y without A learning y.
4. [counterparty] Roles reverse: B holds OPRF key k_B; A sends its table entries and receives PRF(k_B, x) for each x without B learning x.
5. [counterparty] A locally computes PRF(k_A, x) for its own elements and sends these tags to B. B does the same with PRF(k_B, y) and sends its tags to A.
6. [counterparty] Each party compares the tags it computed via the OPRF step against the tags the other party sent, and maps equal tags back to its own plaintext elements.

## Guarantees & threat model

Guarantees:

- Input privacy: non-intersecting elements are computationally hidden under OT hardness and PRF security.
- Bilateral: runs directly between two parties over an authenticated channel.
- Completeness: all shared elements are found, assuming cuckoo insertion succeeds (negligible failure probability with stash slots).
- Soundness: zero false positives under a collision-resistant PRF.
- Scalability: O(n + m) communication with small constants; amortises well as sets grow.

Threat model:

- OT and PRF security; in particular, the base OT must remain secure against the network adversary.
- Honest cuckoo construction by both parties. A malicious party can skew table layout to probe specific identifiers; commit-and-prove variants mitigate.
- Authenticated transport between the parties.
- Set-size hygiene: singleton or near-singleton submissions turn the protocol into a yes/no oracle on the submitted element.

## Trade-offs

- More moving parts than the DH-based variant: an OT extension library and cuckoo-hashing machinery are required.
- Larger per-element constant factor than DH-based due to OT base setup, but linear communication amortises for large sets.
- Cuckoo hashing has a small insertion-failure probability. Stash slots or larger tables mitigate at minor cost.
- Equality-only: aggregates over the intersection require the circuit-based variant.

## Example

Two custodians hold flagged-address lists under different jurisdictions. Custodian A holds 500k addresses and Custodian B holds 400k. Both run the bilateral OPRF intersection protocol. They discover 8,200 addresses appearing on both lists; the remaining 491,800 and 391,800 non-overlapping entries are not disclosed. Matched addresses feed into a joint investigation workflow.

## See also

- [RFC 9497: Oblivious Pseudorandom Functions (OPRFs) using Prime-Order Groups](https://datatracker.ietf.org/doc/rfc9497/)
- [Kolesnikov et al. 2016: Efficient Batched Oblivious PRF with Applications to Private Set Intersection](https://eprint.iacr.org/2016/799)
- [Pinkas et al. 2019: Efficient Circuit-based PSI with Linear Communication](https://eprint.iacr.org/2019/241)

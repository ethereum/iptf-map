---
title: "Pattern: Private Set Intersection (DH-based)"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Two parties discover shared set elements without revealing non-matching entries
assumptions: Bilateral communication channel, DDH hardness, sets contain exact-match identifiers
last_reviewed: 2026-03-18
works-best-when:
  - Both parties hold private sets of comparable size (< 10k elements)
  - Matching is bilateral (exactly two parties)
  - Elements are exact-match identifiers (addresses, ISINs, LEIs)
avoid-when:
  - More than two parties need to participate (use circuit-based or MPC variant)
  - Fuzzy or approximate matching is required
  - One party's set is already public (use Merkle inclusion proof instead)
dependencies: [ECDH, hash-to-curve]
context: both
crops_profile:
  cr: high
  os: yes
  privacy: full
  security: high
---

## Intent

Two parties each hold a private set of identifiers and want to learn which elements they share without exposing the rest. This variant uses commutative encryption via ECDH: both parties blind their inputs with secret scalars, and the commutativity of scalar multiplication lets them compare double-blinded values without revealing the originals. The protocol runs bilaterally between the two parties.

## Ingredients

- **Cryptography**: ECDH (commutative scalar multiplication), hash-to-curve
- **Infra**: Authenticated bilateral channel (TLS, Noise, or similar)
- **Off-chain**: Ephemeral computation, no persistent infrastructure required

## Protocol

1. **Agree**: Parties A and B fix an elliptic curve and hash-to-curve function. Each generates an ephemeral secret scalar (a, b).
2. **Blind**: A hashes each element to a curve point and multiplies by a, sending {aH(x)} to B. B does the same with scalar b, sending {bH(y)} to A.
3. **Double-blind**: B multiplies A's blinded set by b, sending {abH(x)} to A. A multiplies B's blinded set by a, sending {abH(y)} to B.
4. **Match**: Each party now holds both {abH(x)} and {abH(y)}. Each compares the two sets; equal points are the intersection.
5. **Output**: Each party maps matched points back to their own plaintext elements. Non-matching elements stay hidden behind the other party's scalar.

## Guarantees

- **Input privacy**: Non-intersecting elements are computationally hidden under DDH.
- **Bilateral**: Runs directly between two parties without a server or operator.
- **Completeness**: All shared elements are found (zero false negatives).
- **Soundness**: Zero false positives (collision-resistant hash-to-curve).
- **I2I**: Institutions match order books, reconcile settlement, or deduplicate KYC without revealing full client lists.
- **I2U**: A user checks if their address appears in an institution's eligibility list without the institution learning the user's other addresses.

## Trade-offs

- O(n + m) curve points exchanged. Practical for sets under 10k; for larger sets, use the OT/OPRF-based variant.
- 2(n + m) scalar multiplications. Seconds for 10k elements on commodity hardware.
- Limited to equality checks. Aggregates over the intersection require the circuit-based variant.
- Semi-honest security by default. Malicious security requires additional ZK commitments proving the blinded set matches a committed set.
- Privacy degrades if a party submits a singleton set (reveals whether that element is in the other's set). Mitigate with a minimum set-size policy.
- **CROPS context**: Applies to both I2I and I2U. CR is `high` because both parties run the protocol directly without an intermediary that could censor or filter matches. In I2I, institutions execute the protocol bilaterally over an authenticated channel. In I2U, the user runs their side independently on commodity hardware. Privacy degrades from `full` to `partial` if either party submits a very small set, since intersection membership becomes attributable to specific elements.

## Example

- Bank A holds 500 ISINs it wants to buy.
- Bank B holds 300 ISINs it wants to sell.
- Both run ECDH-PSI bilaterally.
- They discover 12 ISINs overlap as potential trades.
- The remaining 488 and 288 non-overlapping ISINs stay hidden.
- The 12 matched ISINs feed into [ERC-7573 DvP](pattern-dvp-erc7573.md) for execution.

## See also

- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC for ongoing shared state, vs one-shot matching here
- [VOPRF Nullifiers](pattern-voprf-nullifiers.md): OPRF is a building block in OT-based PSI variants
- [DvP (ERC-7573)](pattern-dvp-erc7573.md): downstream consumer, matched trade to settlement
- [Pre-trade Privacy Encryption](pattern-pretrade-privacy-encryption.md): alternative approach for pre-trade discovery
- [MPC Custody](pattern-mpc-custody.md): shares the MPC trust model family

## See also (external)

- [Google Private Join and Compute](https://github.com/google/private-join-and-compute): ECDH-PSI + homomorphic encryption for aggregate computation over intersections
- [OpenMined PSI](https://github.com/OpenMined/PSI): ECDH-PSI with Bloom filters, available in C++, Python, Go, and JavaScript
- [Encrypto Group PSI](https://github.com/encryptogroup/PSI): benchmarking implementations of multiple PSI protocol variants

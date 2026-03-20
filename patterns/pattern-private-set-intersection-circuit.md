---
title: "Pattern: Private Set Intersection (Circuit-based)"
status: draft
maturity: PoC
layer: offchain
privacy_goal: Two parties discover shared set elements and compute arbitrary functions over the intersection without revealing non-matching entries
assumptions: Bilateral communication channel, OT security, function to compute is fixed at circuit-compile time
last_reviewed: 2026-03-18
works-best-when:
  - The result needed is a function over the intersection (count, sum, threshold), not the raw intersection itself
  - Set sizes are small to moderate (circuit size scales with O((n+m) log(n+m) * σ) Boolean gates, where σ is element bit-width)
  - The function and set sizes are known at circuit-compile time
avoid-when:
  - Only the intersection itself is needed (DH or OPRF variants are simpler and faster)
  - Sets are large (Boolean circuit blowup makes this impractical beyond ~10k elements for 256-bit identifiers)
  - Compilation and garbling cost per execution is prohibitive for the use case
dependencies: [Authenticated garbling, OT extensions, Boolean circuit compiler]
context: both
crops_profile:
  cr: high
  os: yes
  privacy: full
  security: medium
---

## Intent

Two parties each hold a private set and want to compute a function over their shared elements without either party learning the raw intersection. Intersection-finding logic is embedded inside the circuit alongside the aggregate function F, so the output is limited to F(intersection). The raw matches are not revealed to either party. The circuit is evaluated jointly using authenticated garbling or secret-shared circuits (GMW).

## Ingredients

- **Cryptography**: Authenticated garbling (Wang-Ranellucci-Katz 2017) or secret-shared circuits (GMW), Oblivious Transfer (OT) extensions, sort-compare-shuffle or hash-based circuit design
- **Infra**: Authenticated bilateral channel (TLS, Noise, or similar)
- **Off-chain**: Circuit compiler (Bristol format or equivalent), ephemeral computation

## Protocol

1. **Compile**: Parties agree on function F and set sizes. Both compile a Boolean circuit C encoding matching logic (sort-compare-shuffle or hash-based) plus F. Circuit size is fixed to the agreed parameters.
2. **Garble**: A generates fresh garbled tables for every gate in C and sends the garbled circuit to B.
3. **Transfer inputs**: A encodes its inputs into garbled labels directly. B obtains garbled labels for its inputs via OT.
4. **Evaluate**: B evaluates the garbled circuit gate-by-gate, producing the garbled output.
5. **Reveal**: A shares the output decoding table with B. B decodes locally, then sends the garbled output labels to A. Both parties learn F(intersection).

## Guarantees

- **Input privacy**: Each party's set remains opaque to the other inside the garbled circuit.
- **Function generality**: Encodes any Boolean function over the intersection, including cardinality, weighted sums, or threshold predicates.
- **Completeness**: Deterministic evaluation over all shared elements (zero false negatives).
- **I2I**: Institutions compute aggregates over shared portfolios or flagged-entity overlaps without exposing full books.
- **I2U**: A user verifies whether their credential set meets an institution's threshold without revealing which credentials they hold.

## Trade-offs

- Circuit size scales with O((n + m) log(n + m) * σ) gates for sort-compare-shuffle, where σ is the element bit-width. For 256-bit identifiers, this becomes costly beyond ~10k elements per party.
- Circuit must be compiled for a fixed function and fixed set sizes. Each execution requires fresh garbling (single-use). Input-independent preprocessing can be done ahead of time.
- Semi-honest security by default. Authenticated garbling (Wang-Ranellucci-Katz 2017) achieves malicious security at ~2-3x overhead.
- Garbling has asymmetric roles (garbler transmits the full circuit). The garbler holds the output decoding table and can withhold it, preventing the evaluator from learning the result. In I2U, the institution typically garbles. GMW supports more than 2 parties but requires MPC-based garbling or a trusted dealer for preprocessing.
- **CROPS context**: Applies to both I2I and I2U. CR is `high` because both parties participate directly in circuit evaluation over a bilateral channel. In I2I, institutions jointly evaluate the circuit over an authenticated channel. In I2U, the user evaluates their side on commodity hardware. Privacy is `full` because the garbled circuit hides both inputs and intermediate computation; the output is limited to the agreed-upon function result.

## Example

- Compliance Team A holds 2,000 flagged wallet addresses; Team B holds 3,500.
- Both compile a PSI-cardinality circuit that outputs the intersection count.
- After garbling, OT, and evaluation, both learn the count: 47 shared flags.
- The matching addresses themselves stay private. If the count exceeds a threshold, they escalate to supervised disclosure.

## See also

- [Private Set Intersection (DH-based)](pattern-private-set-intersection-dh.md): simpler ECDH variant for when the raw intersection is sufficient
- [Private Set Intersection (OPRF-based)](pattern-private-set-intersection-oprf.md): OT/OPRF variant for large sets (10k+ elements)
- [Private Set Intersection (FHE-based)](pattern-private-set-intersection-fhe.md): FHE variant for asymmetric set sizes with post-quantum security
- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC for ongoing shared state, vs one-shot computation here
- [DvP (ERC-7573)](pattern-dvp-erc7573.md): downstream consumer when matched trades feed into settlement
- [Pre-trade Privacy Encryption](pattern-pretrade-privacy-encryption.md): alternative approach for pre-trade discovery
- [ABY Framework](https://github.com/encryptogroup/ABY): mixed-protocol framework supporting arithmetic, Boolean, and Yao sharing for two-party computation
- [EMP-toolkit](https://github.com/emp-toolkit): efficient MPC toolkit with garbled circuit implementations and semi-honest/malicious protocols
- [MOTION Framework](https://github.com/encryptogroup/MOTION): mixed-protocol MPC framework supporting BMR (multi-party garbled circuits), GMW, and arithmetic sharing for two or more parties

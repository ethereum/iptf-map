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
  security: high
---

## Intent

Two parties each hold a private set and want to compute a function over their shared elements without either party learning the raw intersection. The key distinction from other PSI variants: intersection-finding logic is embedded inside the circuit alongside the aggregate function F, so the only output is F(intersection). The raw matches are never revealed to either party. This enables use cases where knowing *which* elements overlap would itself be sensitive. The circuit is evaluated jointly using authenticated garbling or secret-shared circuits (GMW). More expensive per element than DH-based PSI, but able to compute arbitrary functions: cardinality, sum, threshold checks, or filtered subsets.

## Ingredients

- **Cryptography**: Authenticated garbling (Wang-Ranellucci-Katz 2017) or secret-shared circuits (GMW), Oblivious Transfer (OT) extensions, sort-compare-shuffle or hash-based circuit design
- **Infra**: Authenticated bilateral channel (TLS, Noise, or similar)
- **Off-chain**: Circuit compiler (Bristol format or equivalent), ephemeral computation

## Protocol

1. **Agree**: Parties A and B fix a circuit compiler and agree on the target function F to compute over the intersection (e.g. cardinality, sum of associated values, threshold test).
2. **Compile**: Both parties compile a Boolean circuit C that encodes the matching logic (sort-compare-shuffle or hash-based) plus the aggregate function F. The circuit takes both sets as input and outputs F(intersection). Circuit size is fixed to the agreed set sizes.
3. **Garble**: A, acting as garbler, generates fresh garbled tables for every gate in C and sends the garbled circuit to B. Garbling is done fresh for each execution.
4. **Transfer inputs**: A encodes its inputs into garbled labels directly. B obtains garbled labels for its inputs via OT, so A learns nothing about B's inputs and B learns nothing beyond what the circuit output reveals.
5. **Evaluate**: B evaluates the garbled circuit gate-by-gate using the garbled tables and input labels, producing the garbled output.
6. **Reveal**: A shares the output decoding table with B. B decodes the garbled output locally. B also sends the garbled output labels to A, who decodes independently. Both parties learn F(intersection).

## Guarantees

- **Input privacy**: Non-intersecting elements are hidden inside the garbled circuit. Each party's set remains opaque to the other.
- **Bilateral**: Runs directly between two parties over an authenticated channel.
- **Function generality**: The circuit encodes any Boolean function over the intersection, including cardinality, weighted sums, or threshold predicates.
- **Completeness**: Deterministic evaluation over all shared elements (minimal false negatives).
- **Soundness**: Malicious security achievable via authenticated garbling.
- **I2I**: Institutions compute aggregates over shared portfolios, flagged-entity overlaps, or netting totals without exposing full books.
- **I2U**: A user verifies whether their credential set meets an institution's threshold without the institution learning which credentials the user holds.

## Trade-offs

- Circuit size scales with O((n + m) log(n + m) * σ) gates for sort-compare-shuffle, where σ is the element bit-width. Practical for sets up to ~100k elements per party.
- Communication overhead is higher than DH-based PSI: the garbled circuit itself must be transmitted, typically several MB for moderate set sizes.
- Circuit must be compiled for a fixed function AND fixed set sizes. Changing either requires recompilation. Each execution requires fresh garbling (garbled circuits are single-use). Some preprocessing (input-independent) can be done ahead of time.
- Semi-honest security by default. Authenticated garbling (Wang-Ranellucci-Katz 2017) achieves malicious security at ~2-3x overhead.
- Asymmetric roles in garbling (garbler vs evaluator). Both parties learn the output, but the garbler must transmit the full garbled circuit. GMW supports more than 2 parties but requires MPC-based garbling or a trusted dealer for preprocessing, plus more communication rounds.
- OT extensions (IKNP or SoftSpoken) amortize the base OT cost, making per-element OT overhead negligible for sets above a few hundred elements.
- **CROPS context**: Applies to both I2I and I2U. CR is `high` because both parties participate directly in circuit evaluation over a bilateral channel. In I2I, institutions jointly evaluate the circuit over an authenticated channel. In I2U, the user evaluates their side on commodity hardware. Privacy is `full` because the garbled circuit hides both inputs and intermediate computation; only the agreed-upon function output is revealed.

## Example

- Compliance Team A holds 2,000 flagged wallet addresses.
- Compliance Team B holds 3,500 flagged wallet addresses.
- They want to know how many flagged addresses they share, without revealing which specific addresses overlap.
- Both compile a PSI-cardinality circuit that outputs only the intersection count.
- After garbling, OT, and evaluation, both learn the count: 47 shared flags.
- Both sides learn the count; the matching addresses themselves stay private.
- If the count exceeds a risk threshold, they escalate to a supervised disclosure protocol.

## See also

- [Private Set Intersection (DH-based)](pattern-private-set-intersection-dh.md): simpler ECDH variant for when only the raw intersection is needed
- [Private Set Intersection (OPRF-based)](pattern-private-set-intersection-oprf.md): OT/OPRF variant for large sets (10k+ elements)
- [Private Set Intersection (FHE-based)](pattern-private-set-intersection-fhe.md): FHE variant for asymmetric set sizes with post-quantum security
- [Private Shared State (co-SNARKs)](pattern-private-shared-state-cosnark.md): MPC for ongoing shared state, vs one-shot computation here
- [VOPRF Nullifiers](pattern-voprf-nullifiers.md): OPRF is a building block in OT-based PSI variants
- [DvP (ERC-7573)](pattern-dvp-erc7573.md): downstream consumer when matched trades feed into settlement
- [Pre-trade Privacy Encryption](pattern-pretrade-privacy-encryption.md): alternative approach for pre-trade discovery
- [MPC Custody](pattern-mpc-custody.md): shares the MPC trust model family

## See also (external)

- [ABY Framework](https://github.com/encryptogroup/ABY): mixed-protocol framework supporting arithmetic, Boolean, and Yao sharing for two-party computation
- [EMP-toolkit](https://github.com/emp-toolkit): efficient MPC toolkit with garbled circuit implementations and semi-honest/malicious protocols
- [MOTION Framework](https://github.com/encryptogroup/MOTION): mixed-protocol MPC framework supporting BMR (multi-party garbled circuits), GMW, and arithmetic sharing for two or more parties

---
title: "Pattern: Private Set Intersection (Circuit-based)"
status: draft
maturity: testnet
type: standard
layer: offchain
last_reviewed: 2026-04-22

works-best-when:
  - The result needed is a function over the intersection (count, sum, threshold), not the raw intersection itself.
  - Set sizes are small to moderate (circuit size scales with O((n+m) log(n+m) * sigma) Boolean gates, where sigma is element bit-width).
  - The function and set sizes are known at circuit-compile time.
avoid-when:
  - Only the raw intersection is needed (DH or OPRF variants are simpler and faster).
  - Sets are large (Boolean-circuit blowup makes this impractical beyond about 10k elements for 256-bit identifiers).
  - Compilation and garbling cost per execution is prohibitive for the use case.

context: both
context_differentiation:
  i2i: "Between institutions, circuit-based intersection is typically contracted between known parties, with the function and set sizes fixed up front in the agreement. Roles are assigned bilaterally (who garbles, who evaluates) and SLAs cover delivery of the output decoding table."
  i2u: "For users, the institution typically holds the garbler role, which means the institution can withhold the output decoding table. Users should rely on authenticated garbling with output commitments so that withheld outputs are detectable and punishable."

crops_profile:
  cr: high
  o: yes
  p: full
  s: medium

crops_context:
  cr: "Both parties participate directly in the circuit evaluation over a bilateral channel. No on-chain component is required, so chain-level censorship does not apply."
  o: "Open-source MPC and garbled-circuit toolkits are widely available; circuit compilers and evaluation runtimes are published under permissive licenses."
  p: "The garbled circuit hides both inputs and intermediate computation. Output is limited to the agreed function F(intersection), so neither party sees the raw matches unless F is chosen to reveal them."
  s: "Semi-honest by default. Authenticated garbling achieves malicious security at roughly 2 to 3 times overhead. Soundness of the result depends on the honesty of the garbler; withholding the output decoding table blocks the evaluator from learning F."

post_quantum:
  risk: medium
  vector: "Base OT and authenticated-garbling MACs in standard MPC pipelines use elliptic-curve primitives broken by a CRQC. Garbling itself is symmetric and resists quantum analysis once base OT is secure."
  mitigation: "Swap base OT for a lattice-based or code-based post-quantum OT construction and use hash-based MACs. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  alternative_to: [pattern-private-set-intersection-dh, pattern-private-set-intersection-oprf, pattern-private-set-intersection-fhe]
  composes_with: [pattern-dvp-erc7573, pattern-pretrade-privacy-encryption]
  see_also: [pattern-private-shared-state-cosnark, pattern-co-snark, pattern-mpc-custody]

open_source_implementations:
  - url: https://github.com/encryptogroup/ABY
    description: "ABY: mixed-protocol framework supporting arithmetic, Boolean, and Yao sharing for two-party computation"
    language: "C++"
  - url: https://github.com/emp-toolkit
    description: "EMP-toolkit: MPC toolkit with garbled-circuit implementations and semi-honest and malicious protocols"
    language: "C++"
  - url: https://github.com/encryptogroup/MOTION
    description: "MOTION: mixed-protocol MPC framework supporting BMR (multi-party garbled circuits), GMW, and arithmetic sharing for two or more parties"
    language: "C++"
---

## Intent

Two parties each hold a private set and want to compute a function over their shared elements without either party learning the raw intersection. Intersection-finding logic is embedded in a Boolean circuit alongside the aggregate function F, so the output is limited to F(intersection). The circuit is evaluated jointly using authenticated garbling or secret-shared circuits, and the raw matches are not revealed to either party.

## Components

- Circuit compiler (Bristol format or equivalent) that emits a Boolean circuit encoding the matching logic (sort-compare-shuffle or hash-based) plus the aggregate function F.
- Garbled-circuit or GMW runtime that turns the compiled circuit into an interactive protocol.
- OT extension library providing base OTs for garbled-label transfer.
- Authenticated bilateral channel for garbled-table transmission and OT.
- Output decoding table and, for authenticated garbling, commitments binding the garbler to the circuit it sent.

## Protocol

1. [counterparty] Parties agree on function F and set sizes, then compile a Boolean circuit C encoding the matching logic plus F. Circuit size is fixed to the agreed parameters.
2. [counterparty] Party A generates fresh garbled tables for every gate in C and sends the garbled circuit to Party B.
3. [counterparty] A encodes its inputs into garbled labels directly. B obtains garbled labels for its inputs via OT.
4. [counterparty] B evaluates the garbled circuit gate by gate, producing the garbled output.
5. [counterparty] A sends the output decoding table to B. B decodes locally, then sends the garbled output labels to A so that A can also decode.

## Guarantees & threat model

Guarantees:

- Input privacy: each party's set is opaque to the other inside the garbled circuit.
- Function generality: encodes any Boolean function over the intersection, including cardinality, weighted sums, or threshold predicates.
- Completeness: deterministic evaluation over all shared elements (zero false negatives).
- Output confined to F: neither party learns the raw matches unless F is chosen to reveal them.

Threat model:

- Soundness of the garbling scheme and OT extension.
- Honest garbler (semi-honest baseline); authenticated garbling (Wang-Ranellucci-Katz 2017) achieves malicious security at about 2 to 3 times overhead.
- Non-withholding garbler: the garbler holds the output decoding table and can refuse to release it, preventing the evaluator from learning F. Commit-and-open variants make withholding detectable.
- Authenticated transport between the parties; otherwise a network attacker can swap labels or tables.

## Trade-offs

- Circuit size scales with O((n + m) log(n + m) * sigma) gates for sort-compare-shuffle, where sigma is the element bit-width. For 256-bit identifiers this becomes costly beyond about 10k elements per party.
- Circuit is fixed to a function and set size: each execution needs fresh garbling, though input-independent preprocessing can be done ahead of time.
- Asymmetric roles: the garbler transmits the full circuit and holds the output decoding table. Role assignment matters in I2U deployments.
- GMW supports more than two parties but requires MPC-based garbling or a trusted dealer for preprocessing.

## Example

Two compliance teams want to count how many wallet addresses appear on both of their flagged lists without revealing which addresses match. Team A holds 2,000 flagged addresses and Team B holds 3,500. Both compile a PSI-cardinality circuit that outputs the intersection count. After garbling, OT, and evaluation, both learn the count (47 shared flags). The matching addresses themselves stay private, and if the count exceeds a threshold the teams escalate to supervised disclosure.

## See also

- [Huang et al. 2012: Faster Secure Two-Party Computation Using Garbled Circuits](https://www.usenix.org/system/files/conference/usenixsecurity11/sec11-final229.pdf)
- [Wang, Ranellucci, Katz 2017: Authenticated Garbling and Efficient Maliciously Secure Two-Party Computation](https://eprint.iacr.org/2017/030)
- [Pinkas et al. 2019: Efficient Circuit-based PSI with Linear Communication](https://eprint.iacr.org/2019/241)

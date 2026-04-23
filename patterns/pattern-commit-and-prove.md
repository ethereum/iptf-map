---
title: "Pattern: Commit-and-Prove Fallback"
status: draft
maturity: testnet
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Both parties accept extra coordination overhead.
  - Circuit complexity or infra constraints block other patterns.
avoid-when:
  - Near-real-time settlement is required (added latency).

context: both
context_differentiation:
  i2i: "Both counterparties typically have legal recourse if one leg finalizes and the other does not, reducing the practical impact of weak atomicity. Commitments can be backed by bilateral netting agreements. Irreversibility of a one-sided settlement is manageable through off-chain remedies."
  i2u: "End-users lack equivalent legal remedies for a stuck half-settled trade. Protocol-enforced timelocks with forced-refund paths become critical, and the user must be able to unilaterally reclaim funds on any chain without operator cooperation."

crops_profile:
  cr: medium
  o: partial
  p: none
  s: medium

crops_context:
  cr: "Reaches `high` with protocol-enforced timelocks and forced-withdrawal paths on both chains, removing any operator ability to strand a leg. Drops to `low` if one chain is an operator-controlled rollup without exit proofs."
  o: "Coordination logic is often bespoke and may be proprietary. Improves to `yes` when the runbook and timeout contracts are open-sourced under a permissive license."
  p: "No amount or counterparty privacy at the base layer. The shared commitment `C` creates a meta-linkage between the two legs observable to anyone watching both chains. Can reach `partial` by proving knowledge of `C`'s pre-image via ZK instead of revealing `C`."
  s: "Rides on the security of each chain's settlement and the commitment scheme's binding property. Honest counterparty behavior is required to post both legs; dishonesty is mitigated through timeout refunds but the mitigation is economic, not cryptographic."

post_quantum:
  risk: medium
  vector: "Commitment schemes built on discrete log (Pedersen) broken by CRQC. Signatures on settlement transactions inherit the host chain's signature assumptions."
  mitigation: "Hash-based commitments (SHA-2, SHA-3) resist CRQC. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-20, EIP-7573]

related_patterns:
  alternative_to: [pattern-dvp-erc7573]
  composes_with: [pattern-verifiable-attestation, pattern-forced-withdrawal]
  see_also: [pattern-cross-chain-privacy-bridge]

open_source_implementations: []
---

## Intent

Coordinate a cross-chain settlement by having both parties post commitments to a shared secret witness `C = Com(w)`. Each leg of the trade references `C`, so auditors can link the two legs after the fact and each chain can verify its side against the same binding commitment. Atomicity is conditional: both legs settle independently, but neither can claim to have settled against a different commitment than the other.

## Components

- **Commitment scheme** (hash-based or Pedersen) binds the shared witness `w` to a public value `C` that both parties post.
- **Per-chain settlement contracts** accept a settlement transaction that references `C` and verifies local conditions (asset transfer, payment).
- **Coordination layer** (off-chain) holds the pre-image `w`, sequences the two legs, and drives retry logic.
- **Timeout and refund paths** on each chain allow a counterparty to reclaim funds if the other leg never posts within a deadline.
- **Attestation log** (optional) records the commitments and settlement events for later audit.

## Protocol

1. [user] Both parties agree off-chain on trade terms and jointly generate witness `w`. Each party computes `C = Com(w)`.
2. [user] Party A posts the asset leg on Chain A with settlement bound to `C`.
3. [user] Party B posts the cash leg on Chain B with settlement bound to `C`.
4. [contract] Each chain locally verifies its leg against `C` and finalizes if valid.
5. [contract] If one leg's timeout expires without a matching counter-leg, the affected party invokes the refund path to reclaim their assets.
6. [auditor] A later auditor can correlate the two legs via the shared `C` without needing to coordinate the chains in real time.

## Guarantees & threat model

Guarantees:

- Both legs are cryptographically bound to the same witness, so neither party can claim settlement against a different trade.
- Each chain's finalization is independent, providing conditional atomicity: if both legs post before their timeouts, the trade is effectively atomic.
- Auditable commitments support post-hoc reconciliation.

Threat model:

- Soundness of the commitment scheme (binding property). A broken commitment allows a party to claim a different `w` than was agreed.
- Non-censoring sequencer or validator set on both host chains during the settlement window. A censored leg triggers the refund path but breaks liveness.
- Honest off-chain coordination is assumed. Both parties must actually post their legs; dishonesty is mitigated only by timeouts, not by cross-chain enforcement.
- No cross-chain revert: once one leg finalizes, it cannot be rolled back. True all-or-nothing atomicity is out of scope and requires a different pattern.

## Trade-offs

- Slower than single-chain settlement; requires round-trips and retries.
- Meta-linkage risk: the shared `C` is visible on both chains and correlates otherwise-independent flows.
- No built-in amount privacy. Each chain's leg reveals whatever the host protocol exposes.
- Refunds require reliable timeout handling on both sides; operational failures can strand funds until manual intervention.

## Example

- Two institutions agree off-chain on a bond-for-stablecoin trade and jointly generate witness `w`.
- The asset issuer locks the bond on the issuance chain with settlement bound to `C = Com(w)`.
- The buyer locks the stablecoin on the payment chain with settlement bound to the same `C`.
- Both legs finalize independently within their timeout windows. An auditor later correlates the two legs via `C`.

## See also

- [EIP-7573 specification](https://ercs.ethereum.org/ERCS/erc-7573)

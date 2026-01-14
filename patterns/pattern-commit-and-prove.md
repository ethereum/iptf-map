---
title: "Pattern: Commit-and-Prove Fallback"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: Achieve conditional atomicity via shared commitments across chains
assumptions: On-chain commitment contracts, coordination runbook, both parties accept coordination overhead
last_reviewed: 2026-01-14
works-best-when:
  - Both parties accept extra coordination overhead.
  - Circuit complexity or infra constraints block other patterns.
avoid-when:
  - Near-real-time settlement is required (added latency).
dependencies:
  - ERC-7573, EAS (commit attestations)
---

## Intent

Fallback atomic DvP by both parties posting commitments to shared secret `C=Com(w)`; each leg verified against `C` before settlement.

## Ingredients

- **Standards**: ERC-7573, ERC-20
- **Infra**: On-chain commitment contracts
- **Off-chain**: Coordination runbook

## Protocol (concise)

1. Both parties commit to secret witness `w` via `C=Com(w)`.
2. Party A posts proof bound to `C` on Chain A.
3. Party B posts proof bound to `C` on Chain B.
4. Each chain verifies proofs locally; if both legs are posted and valid, settlement is effectively atomic.
5. If only one leg is posted, the other remains unsettled — unless additional mechanisms (time-locks, refund paths, relayers) are layered in.

## Guarantees

- Conditional atomicity only: both legs reference the same `C`, but each chain finalizes independently.
  - If one leg finalizes and the other fails to appear, there is no cross-chain revert.
  - True all-or-nothing atomicity requires additional mechanisms (zk-SPV, single-domain execution).
- Minimal infra requirements.
- Provides auditable commitments.

## Trade-offs

- Slower, requires coordination & retries.
- Commitment reveals meta-linkage.
- No built-in privacy of amounts.
- Irreversibility: once one chain finalizes, that leg cannot be rolled back.
- Refunds/time-locks are required to mitigate stuck or one-sided settlements.

## Example

- Bank A commits to selling €5m bond, Bank B commits to paying EURC.
- Both commit to shared `C`.
- Each leg verifies settlement bound to `C`; both finalize if valid.

## See also

- pattern-dvp-erc7573.md
- pattern-l1-zk-commitment-pool.md
- pattern-zk-htlc.md

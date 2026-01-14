---
title: "Pattern: ZK Shielded Balances for Derivatives"
status: draft
maturity: PoC
layer: L2
privacy_goal: Confidential balances and daily deltas in shielded pool with regulator view keys
assumptions: ERC-6123 SDC, shielded-pool L2, ZK prover infrastructure, key governance for regulators
last_reviewed: 2026-01-14
works-best-when:
  - Daily settlements (margin calls, deltas) must be hidden.
  - Regulators require replayable audits via view keys.
avoid-when:
  - Per-trade cost cannot tolerate zkSNARK overhead.
  - Settlement cadence is infrequent (see bonds pattern instead).
dependencies:
  - ERC-6123
  - ERC-7573 (optional, for atomic coupling)
  - ZK proof system (Groth16, Halo2, STARKs)
---

## Intent

Maintain **confidential balances and daily deltas** inside a shielded pool (commitments + nullifiers). Each day, counterparties jointly produce a ZK proof that:

- the state transition (previous → new commitments) is valid,
- the daily delta is consistent with a **public, oracle-signed** input and shared trade terms,
- no double-spends occur.

The contract accepts the proof and updates the on-chain state without revealing balances or deltas.

For **auditability**, regulators can be provisioned with scoped keys — i.e. cryptographic credentials that allow partial decryption or selective disclosure. These can be implemented via attribute-based encryption (ABE), selective disclosure keys, or separately issued viewing keys. The scope defines what and when regulators can see (e.g., margin balances over a period, threshold breaches), without granting full visibility into all transactions.

## Ingredients

- **Standards**: ERC-6123 (derivatives), ERC-7573 (optional coupling)
- **Infra**: Shielded-pool contracts on L2; ZK prover infra; keeper/scheduler
- **Off-chain**: Key mgmt for regulators; ICMA XML integration

## Protocol (concise)

1. Parties deposit collateral into shielded pool → commitments created.
2. Daily oracle provides valuation input.
3. **Either side** proves in ZK: _“balances updated per delta, caps enforced”_.
4. Proof posted to SDC contract; nullifiers update commitments.
5. Regulator can replay using viewing keys or ZK attestations.

## Guarantees

- Hides balances, deltas, daily transfers.
- Preserves ERC-6123 semantics (capped-deal, margin enforcement).
- Provides regulator-only disclosure path.

## Trade-offs

- Proving costs daily; may need batching.
- Complexity of circuits (margin, cap, unwind).
- Requires strong key governance.

## Example

- Party A vs Party B in 1y interest rate swap.
- Margin held in shielded balances.
- Each day: ZK proof updates deltas & enforces margin requirements.
- Regulator receives disclosure key for audit.

## See also

- [pattern-l1-zk-commitment-pool.md](pattern-l1-zk-commitment-pool.md)
- pattern-confidential-erc20-fhe-l2-erc7573.md
- [pattern-regulatory-disclosure-keys-proofs.md](pattern-regulatory-disclosure-keys-proofs.md)

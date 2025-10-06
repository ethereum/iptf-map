---
title: "Pattern: ZK Proof of Private State Transition"
status: draft
maturity: PoC
works-best-when:
  - Oracle price or price change is public and signed.
  - Counterparties share the same private state (notional, direction, balances).
avoid-when:
  - Payoff depends on additional private inputs unknown to the other party.
dependencies:
  - ERC-6123
  - zkSNARK prover/verifier
  - (optional) Shielded-pool ledger (commitments + nullifiers)
  - (optional) CoSnark prover/verifier
---

## Intent

Apply **daily margin updates (delta)** for a plain swap **without revealing delta or balances on-chain**.  
One party (either side) proves in ZK that:

- the oracle input used is authentic (signature bound to `marketId`, `dayIndex`),
- `delta = f(N, price, direction, caps)` with **N, direction, delta** kept private,
- the ledger/state **transitions from C_prev to C_next** with no double-spend and margin rules enforced.

## Protocol (concise)

1. Oracle publishes `(price or delta_p)` with signature for `(marketId, dayIndex)`.
2. Either counterparty builds a ZK proof with witness = {N, direction, balances, delta}.
3. Submit `(proof, C_prev, C_next, dayIndex, oracleDigest, oracleSig)` to the SDC.
4. Contract verifies the proof + oracle signature and updates state to `C_next`.

## Trust assumptions

- **Prover:** either counterparty; correctness comes from the proof, not from trusting who submitted.
- **Contract:** trusts only the ZK proof and the on-chain oracle public key.
- **Regulator:** optional **scoped view keys** for audits (selective disclosure).

## Guarantees

- Hides delta, balances, notional, direction on-chain.
- Enforces ERC-6123 semantics (caps/margin) via constraints.
- Either side can submit; first valid proof for `(dayIndex, C_prev)` wins.

## Trade-offs

- Daily proving cost; batch if needed.
- Circuit size grows with product features (caps/floors).
- Requires key governance for regulator disclosure.

## Variant (when MPC is needed)

If the payoff uses **additional private inputs that the other party must not learn** (e.g., multi-asset baskets or structured legs), compute delta via **MPC**, then prove the result in ZK (e.g., CoSnarks). This is a **variant**, not the default for plain swaps.

## Example

- 1y IRS, public rate fixings.
- Parties share notional & direction; oracle signs daily rate.
- Prover submits ZK proof “delta computed correctly; C_prev → C_next valid.”
- Chain updates state; no amounts leak.

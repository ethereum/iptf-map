---
title: "Pattern: Private Intent-Based Vaults"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Hide strategy parameters and order flow while keeping deposited assets auditable
assumptions: FHE-enabled chain or privacy L2, intent relayers/solvers, compliance oracles
last_reviewed: 2026-01-14
works-best-when:
  - Institutions or funds need private strategy execution while assets remain transparently custodied.
  - Strategies are automated or intent-driven and should not leak parameters to competitors.
avoid-when:
  - Full on-chain transparency of strategy or yield composition is a regulatory requirement.
  - Low gas environments or limited privacy infra availability.
dependencies: [ERC-20, ERC-7573, EAS, Zama FHE SDK, Oracles]
---

## Intent

Enable institutional or DeFi actors to **express trading or allocation intents** that are executed by a vault **privately** — hiding strategy parameters, order flow, and risk exposure while keeping deposited assets auditable and redeemable.

## Ingredients

- **Standards:** ERC-20 (underlying asset), optional ERC-7573 (atomic execution), EAS (attestations / audit proofs).
- **Infra:** Private L2 or FHE-enabled chain (e.g., Zama, Fhenix).
- **Off-chain Services:** Intent relayers / solvers, strategy engine, compliance oracles, and KMS for encrypted strategy data.

## Protocol

1. **Deposit:** User or institution deposits assets into an intent-based vault (ERC-20 wrapper).
2. **Intent submission:** Depositor submits an **encrypted intent** (target allocation, yield strategy, or hedging goal).
3. **Solver/engine:** Off-chain or enclave executor decrypts or partially computes the intent to generate an execution plan.
4. **Execution:** Vault executes trades or allocations privately on a privacy L2 or FHE runtime.
5. **Settlement:** Results (profits/losses) are reflected on-chain; only aggregate state is public.
6. **Audit:** Regulator or auditor can verify correctness via viewing key or EAS-logged disclosure.

## Guarantees

- **Privacy:** Strategy logic and parameters remain hidden; vault asset balances visible.
- **Integrity:** Intents are cryptographically signed and cannot be altered by solvers.
- **Auditability:** Regulator or LP can verify execution authenticity without revealing details.

## Trade-offs

- **Performance:** FHE or privacy L2 introduces latency and higher gas cost.
- **Complexity:** Requires secure off-chain computation and intent relayer coordination.
- **Risk:** Misconfigured access control or key leakage may expose strategy data.

## Example

- A fund deposits USDC into a private intent-based vault.
- It submits an encrypted intent: _“allocate 60% to ETH yield strategy, 40% to staked T-Bills.”_
- The vault solver computes trades privately via Zama FHE and executes them.
- On-chain, only total AUM and performance metrics are visible.
- Auditor verifies correctness via an EAS-logged proof without seeing strategy composition.

## See also

- [Pattern: Private Stablecoin Payments on Private L2s](./pattern-privacy-l2s.md)
- [Vendor: Orion Finance](https://www.orionfinance.ai/)
- [Vendor: Zama](https://www.zama.ai/)

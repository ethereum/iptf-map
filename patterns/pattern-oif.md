---
title: "Pattern: Open Intent Framework (OIF)"
status: draft
maturity: pilot
layer: hybrid
privacy_goal: No transaction privacy; intents visible to solvers during discovery
assumptions: Active solver network, cross-chain messaging layer, price oracles
last_reviewed: 2026-01-14
rollout-plan: ready to build solvers
works-best-when:
  - Cross-chain settlement needed
  - Intent-based execution preferred
  - Permissionless solver participation desired
avoid-when:
  - Single-chain operations sufficient
  - Transaction privacy required (intents visible to solvers)
---

## Intent

OIF enables cross-chain intent-based settlement where users express desired outcomes and solvers compete to execute them across chains permissionlessly.

## Ingredients

- [OIF contracts](https://github.com/openintentsframework/oif-contracts) for input collection, output delivery, oracle/messaging/settlement
- [OIF solver](https://github.com/openintentsframework/oif-solver) for intent discovery, execution path optimization, cross-chain settlement
- Infrastructure: Cross-chain messaging layer, price oracles

## Protocol (concise)

1. User signs/submits an intent to the smart contract (e.g., “sell X on chain A, deliver Y on chain B”).
2. Solver network monitors the contract(s), indexes new intents and identifies candidate fulfilment opportunities.
3. Solvers compute optimal execution route(s) across chains/bridges/liquidity pools given the intent.
4. The selected solver executes the required cross-chain operations (swaps, messaging, transfers) and uses the settlement layer to ensure final delivery.
5. An oracle or proof mechanism confirms that the output asset has been delivered per intent; the contract (or settlement module) marks the intent complete and releases locked input assets (or refunds if non-fulfilled).
6. If the solver fails or deadline is missed, the system supports cancellation or refund flows (depending on governance/implementation).

## Guarantees

- **Permissionless execution**: any solver that meets the protocol can participate; the framework does not enforce a centralized solver set.
- **Modularity and composability**: developers can swap in different settlement, oracle or messaging layers while still using the intent-based front-end.
- **Higher-level intent abstraction**: users focus on what they want, not how to achieve it; solvers deal with routing/bridging complexity.
- **Transparency (and trade-off)**: intent details (assets, chains, amounts) are visible to solvers during discovery, exposing some MEV/visibility risk.

- _Note_: Cross-chain atomicity is a goal but depends on the settlement layer’s guarantees. Developers should design flows (escrows, resource locking) appropriately to approximate atomic delivery.

## Trade-offs

- Solver network must be active and sufficiently liquid for intents to be fulfilled in a timely way.
- Cross-chain operations inherently carry higher latency and complexity vs. single-chain flows.
- Multi-step cross-chain settlement increases attack surface (messaging proofs, oracle delays).
- Intent visibility

## Example: Cross-Chain Stablecoin Settlement

1. Bank A submits intent: “Transfer 5 M USDC on Ethereum, receive 5 M USDT on Arbitrum”.
2. Solver network discovers the intent and computes execution path (e.g., USDC bridge to Arbitrum → swap to USDT).
3. Winning solver executes the required steps: USDC moved, USDT delivered.
4. Settlement layer verifies delivery and marks the intent complete; Bank A receives 5 M USDT on Arbitrum.
5. If execution fails or misses deadline, the fallback mechanism refunds or cancels the intent.

## See also

- ERC‑7683 — the intent standard supported by OIF and enabling cross-protocol intent interoperability.
- Privacy-preserving intent approaches (for situations where you need intent confidentiality and cannot expose details to solvers).

---
title: "Pattern: Open Intent Framework (OIF)"
status: ready
maturity: production
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Cross-chain settlement is needed.
  - Intent-based execution is preferred over step-by-step transactions.
  - Permissionless solver participation is desired.
avoid-when:
  - Single-chain operations are sufficient.
  - Transaction privacy is required; intents are visible to solvers by default.

context: both
context_differentiation:
  i2i: "Intents broadcast assets, chains, amounts, and deadlines to the solver network, exposing institutional trading strategy to competing solvers. Institutions may need permissioned solver sets or encrypted intents to protect order flow."
  i2u: "Unencrypted user intents are a clear front-running vector against retail order flow. A user-facing deployment must combine OIF with encrypted or committed intents and a sealed-bid auction before the intent becomes visible."

crops_profile:
  cr: high
  o: yes
  p: none
  s: medium

crops_context:
  cr: "High because any solver meeting the protocol can participate; no centralised solver set is required."
  o: "Reference contracts, solver implementation, and the underlying intent standard are open-source and composable with alternative settlement, oracle, and messaging layers."
  p: "None by default. Intents are visible during solver discovery. Could reach `full` by adopting encrypted intent encoding with sealed-bid commitments via threshold encryption, revealed only after solver execution and L1 finality."
  s: "Medium while cross-chain atomicity depends on external settlement and oracle assumptions. Reaches `high` once settlement atomicity and oracle integrity are hardened."

standards: [ERC-7683]

related_patterns:
  composes_with: [pattern-threshold-encrypted-mempool, pattern-pretrade-privacy-encryption]
  see_also: [pattern-cross-chain-privacy-bridge, pattern-private-transaction-broadcasting]

open_source_implementations:
  - url: https://github.com/openintentsframework/oif-contracts
    description: "Contracts for input collection, output delivery, oracle, messaging, and settlement"
    language: "Solidity"
  - url: https://github.com/openintentsframework/oif-solver
    description: "Solver implementation for intent discovery and cross-chain execution"
    language: "TypeScript, Rust"
---

## Intent

Enable cross-chain intent-based settlement where users express desired outcomes and permissionless solvers compete to execute them across chains. The framework separates user intent (what) from execution strategy (how) and plugs into external settlement, oracle, and messaging layers.

## Components

- Intent contracts: input-collection and output-delivery entry points that escrow user assets, record intent parameters, and release funds on proof of fulfilment.
- Solver: off-chain service that indexes intents, computes execution routes (swaps, bridges, liquidity routing), and submits fulfilment transactions.
- Cross-chain messaging layer: transports proofs of fulfilment between origin and destination chains.
- Oracle or proof mechanism: verifies that outputs have been delivered before the origin contract releases inputs.
- Settlement module: finalises the intent and handles refund or cancellation on failure.

## Protocol

1. [user] Sign and submit an intent (for example, sell X on chain A, receive Y on chain B) to the origin contract.
2. [contract] Record the intent and escrow the input asset.
3. [operator] Solvers monitor the contracts, index new intents, and compute candidate execution routes across chains and liquidity sources.
4. [operator] The selected solver executes the required cross-chain operations: swaps, bridging, and destination-chain transfers.
5. [contract] The oracle or proof mechanism verifies that the output has been delivered per the intent.
6. [contract] The settlement module marks the intent complete and releases locked inputs to the solver; on failure or missed deadline, it refunds or cancels per the configured policy.

## Guarantees & threat model

Guarantees:

- Permissionless execution: any solver meeting the protocol can participate.
- Modularity: settlement, oracle, and messaging layers can be swapped while keeping the intent-based front-end.
- Intent-level abstraction: users focus on outcomes; solvers deal with routing and bridging complexity.

Threat model:

- Intent visibility exposes order flow to MEV and strategy leakage during solver discovery.
- Cross-chain atomicity is approximated via escrow and settlement logic; it is not guaranteed at the protocol level and depends on the chosen messaging and settlement modules.
- Oracle and messaging failures can stall withdrawals or cause disputed fulfilment. Escrow and resource-locking design must bound the blast radius.
- Solver liveness: if no solver picks up an intent, the user falls back to cancellation or refund flows.

## Trade-offs

- Solver network must be active and sufficiently liquid for timely fulfilment.
- Cross-chain flows inherently carry higher latency and more failure modes than single-chain transactions.
- Multi-step settlement increases the attack surface (messaging proofs, oracle delays, bridge compromise).
- Intent visibility is a systemic drawback: strategy leakage and front-running are the price of permissionless solver competition.

## Example

- A corporate treasury submits the intent "transfer 5 M USDC on Ethereum, receive 5 M USDT on Arbitrum".
- The solver network indexes the intent and computes an execution path (bridge USDC to Arbitrum, swap to USDT).
- The winning solver executes the steps: USDC is moved, USDT is delivered to the treasury's destination address.
- The settlement layer verifies delivery, the origin contract releases escrowed funds to the solver, and the intent is marked complete.
- On failure or missed deadline, the fallback mechanism refunds the treasury.

## See also

- [ERC-7683: Cross-Chain Intents Standard](https://eips.ethereum.org/EIPS/eip-7683)
- [Open Intents Framework documentation](https://github.com/openintentsframework)

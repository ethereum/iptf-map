---
title: "Pattern: EIL (Ethereum Interoperability Layer)"
status: draft
maturity: concept
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - User needs to execute calls on multiple L2s with one signature.
  - Assets scattered across chains need to be used without bridging friction.
  - No gas on destination chain but funds available on source chain.
avoid-when:
  - Contract-to-contract composability required (use crosschain messaging instead).
  - High-level intent without knowing specific contract calls (solvers better suited).
  - Institutional-scale transfers requiring immediate economic finality.

context: both
context_differentiation:
  i2i: "Between institutions, both counterparties have legal recourse and symmetric trust. Visible call targets and amounts across chains are tolerable given bilateral confidentiality agreements; the value is atomic multi-chain execution without custody intermediaries. Liquidity providers take on slashing risk under L1-enforced dispute rules, so no counterparty depends on operator honesty."
  i2u: "The user is asymmetric to any liquidity provider. The L1 dispute mechanism must guarantee funds cannot be stolen regardless of provider behavior; the user's unilateral exit must not require provider cooperation. Public UserOp contents expose end-user activity to MEV extraction and surveillance, making encrypted submission a priority for user-facing deployments."

crops_profile:
  cr: high
  o: yes
  p: none
  s: high

crops_context:
  cr: "Reaches `high` through a permissionless P2P UserOp mempool where a single honest node is sufficient to propagate intents. Drops if the mempool becomes operator-gated or if liquidity providers coordinate to ignore specific users."
  o: "Open specifications (ERC-4337, EIP-7701, RIP-7859) and open-source SDKs. Any actor can register as a liquidity provider by staking on L1, and users can bypass providers by paying gas directly."
  p: "No privacy. Token amounts, gas limits, and call targets are visible pre-execution across all involved chains. Could reach `partial` by integrating encrypted UserOps via threshold encryption where cross-L2 intents remain encrypted until ordering is finalized."
  s: "Inherits the security of each underlying chain. Liquidity providers face L1 slashing on misbehavior, so user funds cannot be stolen; worst case is a short-term delay. An 8-day unstake window bounds the economic risk window."

post_quantum:
  risk: medium
  vector: "Signature schemes used by ERC-4337 accounts (ECDSA, BLS) are broken by a CRQC. HNDL risk is low since UserOp contents are public and non-confidential."
  mitigation: "Migrate account validation modules to post-quantum signatures (hash-based or lattice-based) once standardized in EIPs."

standards: [ERC-4337, EIP-7701, RIP-7859]

related_patterns:
  composes_with: [pattern-native-account-abstraction, pattern-threshold-encrypted-mempool]
  alternative_to: [pattern-oif, pattern-cross-chain-privacy-bridge]
  see_also: [pattern-forced-withdrawal, pattern-focil-eip7805]

open_source_implementations:
  - url: https://github.com/eth-infinitism/eil-sdk
    description: "TypeScript SDK for constructing multichain UserOps and interacting with the liquidity provider mempool."
    language: TypeScript
---

## Intent

Account-based cross-L2 interoperability where users sign once and execute transactions directly on multiple chains. Crosschain Liquidity Providers supply gas and liquidity via optimistic atomic swaps anchored in an L1 staking contract, but never execute calls on the user's behalf. Dispute resolution on L1 ensures funds cannot be lost or stolen.

## Components

- ERC-4337 account with multichain validation module signs a Merkle root over the set of UserOps, letting one signature authorize calls across many chains.
- CrossChainPaymaster contracts on each L2 accept vouchers from liquidity providers, pay gas, and release funds on the destination.
- L1CrossChainStakeManager tracks liquidity provider registrations and stakes, with an 8-day unstake delay.
- Liquidity providers stake on L1 once per network and quote fees via reverse Dutch auction; stake sizing is O(networks), not O(funds moved).
- P2P UserOp mempool propagates signed intents and vouchers permissionlessly.
- L1 canonical bridge serves as the arbiter for disputes when a liquidity provider misbehaves.

## Protocol

1. [user] Discover registered liquidity providers operating on both source and destination chains.
2. [user] Sign a multichain UserOp. On the source chain, lock funds in the CrossChainPaymaster and request a voucher specifying provider list and fee schedule via reverse Dutch auction. Funds unlock automatically if no voucher arrives promptly.
3. [operator] A liquidity provider claims the source-chain funds by submitting a signed voucher. The same voucher releases provider funds on the destination. Source funds remain locked for one hour before crediting the provider's deposit.
4. [user] Append the provider voucher to the destination UserOp signature and submit to the destination chain.
5. [contract] Destination CrossChainPaymaster verifies the voucher, checks provider deposits, pays gas, and releases funds to the user.
6. [user] Calls execute on the destination. The same signature can traverse any number of additional L2s using more vouchers.
7. [contract] If a provider misbehaves, the L1 dispute mechanism slashes the violating stake and rewards any other provider that supplies a violation proof.

## Guarantees & threat model

Guarantees:

- Censorship resistance via a permissionless mempool where a single honest node is sufficient to propagate intents.
- No trusted intermediaries: users execute their own calls, and disputes resolve on L1.
- Inherits the security of each underlying chain. Providers cannot steal funds; misbehavior is addressed via slashing.
- One signature authorizes operations across all involved chains.
- Latency matches the slowest underlying chain.

Threat model:

- Requires the same account implementation or a compatible validation module on every involved chain.
- Requires the same signing key on every chain until an L1 keystore with L1SLOAD is available.
- Capital efficiency cost: one-hour fund lock on the source chain after voucher issuance.
- Reorg risk on destination chains with frequent reorganizations; a deep reorg can invalidate a voucher redemption.
- Out of scope: application-layer confidentiality. Call targets, amounts, and account identities are all visible.

## Trade-offs

- Not suitable for contract-to-contract composability. The model is account-based.
- ERC-4337 bundler overhead persists until EIP-7701 (Native AA) adoption.
- Dispute mechanism adds complexity compared to simple bridges; wallets must track open vouchers and their dispute windows.
- Requires wallet-side coordination to discover providers and construct cross-chain Merkle roots before signing.

## Example

A user wants to mint a 1 ETH NFT on one L2. They hold 0.8 ETH on a second L2 and 0.5 ETH on a third. The wallet builds three UserOps (two transfers and one mint), signs the Merkle root once, and two liquidity providers supply vouchers on the source chains. Funds atomic-swap to the destination, the mint executes, and the whole flow settles within seconds.

## See also

- [Ethresearch post on trust-minimized cross-L2 interop](https://ethresear.ch/t/eil-trust-minimized-cross-l2-interop/23437)
- [Yoav Weiss: Trust-Minimized Interop with EIL (video)](https://www.youtube.com/watch?v=kFKvZuXUmQY)

---
title: "Pattern: EIL (Ethereum Interoperability Layer)"
status: draft
maturity: ready
rollout-plan: ready to be integrated in wallets
works-best-when:
  - User needs to execute calls on multiple L2s with one signature
  - Assets scattered across chains need to be used without bridging friction
  - No gas on destination chain but funds available on source chain
avoid-when:
  - Contract-to-contract composability required (use crosschain messaging instead)
  - High-level intent without knowing specific contract calls (solvers better suited)
  - Institutional-scale transfers requiring immediate economic finality
dependencies: [ERC-4337, EIP-7701, RIP-7859]
---

## Intent

Account-based cross-L2 interoperability where users sign once and execute transactions directly on multiple chains. XLPs (Crosschain Liquidity Providers) supply gas and liquidity via optimistic atomic swaps, but never execute calls on the user's behalf.

## Ingredients

- ERC-4337 accounts with multichain validation modules (Merkle root over UserOps)
- CrossChainPaymaster contracts on each L2
- L1CrossChainStakeManager for XLP registration
- XLPs staking on L1 (8-day unstake delay, O(networks) not O(funds))
- P2P mempool for UserOp propagation
- L1 canonical bridge for dispute resolution

## Protocol

1. Alice finds registered XLPs operating on both source and destination chains
2. Alice signs multichain `UserOp`. On source chain she locks funds in `CrossChainPaymaster`, requests voucher specifying XLP list and fee schedule (reverse Dutch auction). Request is short-lived; funds unlock if no voucher provided promptly
3. XLP claims Alice's source funds by providing signed voucher (commitment for destination). Same voucher that claims source funds releases XLP funds on destination. Source funds remain locked 1 hour before crediting XLP deposit
4. Alice appends XLP voucher to destination `UserOp` signature, submits to destination chain
5. Destination `CrossChainPaymaster` verifies voucher, checks XLP has sufficient deposits, pays gas and gives Alice the funds
6. Alice's calls execute. Flow can traverse any number of L2s using same signature
7. If XLP misbehaves: L1-based dispute mechanism ensures funds cannot be lost or stolen, penalizes violating XLPs, incentivizes other XLPs to prove violations

## Guarantees

- No privacy improvements (token amounts and gas limits revealed pre-execution; call targets visible on-chain)
- Censorship resistance via permissionless mempool (single honest node sufficient)
- No trusted intermediaries (users execute directly, disputes resolved via L1)
- Same security as underlying chains (XLPs cannot steal funds, only face slashing risk)
- One signature per operation across all chains
- Minimum latency (as fast as underlying chains)

## Trade-offs

- Requires same account implementation or validation module on all chains
- Requires same key on all chains (mitigated long-term via L1 keystore with L1SLOAD)
- 1-hour fund lock on source chain after voucher issuance (capital efficiency cost)
- XLP reorg risk on chains with frequent reorganizations
- Not suitable for contract-to-contract composability (only account-based)
- ERC-4337 overhead until EIP-7701 (Native AA) adoption
- Dispute mechanism adds complexity vs simple bridges

## Example

Arbitrum Alice wants to mint 1 ETH NFT on Linea. She has 0.8 ETH on Arbitrum and 0.5 ETH on Scroll. Wallet generates 3 UserOps (Arbitrum transfer, Scroll transfer, Linea mint), signs Merkle root once. XLPs provide vouchers on Arbitrum and Scroll, Alice's funds atomic-swapped to Linea, NFT minted, all verified within 2-3 seconds total.

## See also

- [Ethrearch post](https://ethresear.ch/t/eil-trust-minimized-cross-l2-interop/23437)
- [Typescript SDK](https://github.com/eth-infinitism/eil-sdk)
- [Yoav Weiss - Trust-Minimized Interop with EIL](https://www.youtube.com/watch?v=kFKvZuXUmQY)

---
title: "Pattern: Shielded-Pool Atomic Swap (ZK-HTLC)"
status: draft
maturity: PoC
works-best-when:
  - Both assets already live in shielded pools (zk-rollups, privacy L2s).
  - Cross-chain atomicity is required without revealing linkages.
avoid-when:
  - No shielded pool infra available on either chain.
  - You rely on public HTLC compatibility for interoperability.
dependencies:
  - ERC-7573 (conditional transfer)
  - Shielded-pool circuits (Railgun, Penumbra, etc.)
---

## Intent

Enable Delivery-versus-Payment where **both legs settle inside shielded pools**; atomicity is enforced by zk-proofs without public hash linkages.

## Ingredients

- **Standards**: ERC-7573, ERC-20
- **Infra**: Shielded pool L2s on both sides, relayer/bridge
- **Off-chain**: Coordination service for proof bundling

## Protocol (concise)

1. Buyer & Seller lock assets in shielded pools (notes).
2. Each side prepares zk-proof: “I spend note X, create note Y, bound to cross-chain relation R.”
3. Shared commitment `C=Com(w)` embeds cross-chain relation.
4. Relayer submits proofs to both chains.
5. Both contracts verify zk-proofs bound to `C`.
6. If both pass, settlement completes atomically.

## Guarantees

- Hides identities, amounts, linkages.
- Atomicity across chains without HTLC timeout races.
- Conditional atomicity: both proofs must be submitted for both legs to settle, but if only one proof is ever posted, that leg can finalize while the other remains incomplete.
- Strong atomicity requires zk-SPV or execution within a single settlement domain.
- Verifiable settlement in shielded pools.

## Trade-offs

- Heavy proving/verifier costs.
- Requires mature shielded-pool infra.
- Circuit complexity for cross-chain binding.

## Example

- Bank A swaps tokenized bond (Chain A, Railgun pool L1) for EURC (Chain B, Aztec).
- Both legs locked in pools.
- Relayer carries zk-proofs across; atomic unlock when both proofs verify.

## See also

- [pattern-l1-zk-commitment-pool.md](pattern-l1-zk-commitment-pool.md)
- pattern-aztec-privacy-l2-erc7573.md
- [pattern-dvp-erc7573.md](pattern-dvp-erc7573.md)
- [pattern-l2-encrypted-offchain-audit.md](pattern-l2-encrypted-offchain-audit.md)

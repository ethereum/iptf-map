---
title: "Pattern: Stateless Plasma Privacy"
status: draft
maturity: PoC
layer: L2
privacy_goal: Private transfers with client-side proving and minimal on-chain footprint
assumptions: Client-side proof generation, block producer availability, user data custody
last_reviewed: 2026-01-27
works-best-when:
  - High transaction volume with privacy requirements
  - Users can manage their own transaction data (institutional clients with infrastructure)
  - Minimal L1 data footprint is critical for cost or privacy
avoid-when:
  - Users cannot reliably store/backup their own state
  - Real-time settlement finality required (Plasma exits have delay)
  - Complex smart contract logic needed (stateless model limits programmability)
dependencies: [ZK proofs, Merkle commitments, L1 anchor contract]
---

## Intent

Use stateless Plasma architecture to enable private token transfers where transaction data remains with users (client-side), only commitments are posted on-chain, and validity is proven via zero-knowledge proofs. This provides strong privacy (no on-chain transaction graph) with L2 scalability.

## Ingredients

- **L1 Anchor Contract**: Stores Merkle roots of valid state; handles deposits/withdrawals
- **Block Producer**: Aggregates transactions, generates inclusion proofs, posts commitments
- **Client-Side Prover**: Users generate ZK proofs for their transactions locally
- **Data Availability**: Users custody their own transaction data (or use optional DA layer)
- **Standards**: ERC-20 for deposits; ZK circuit for transfer validity

## Protocol (concise)

1. **Deposit**: User locks ERC-20 on L1; receives corresponding balance commitment on L2.
2. **Transfer**: Sender generates ZK proof of valid transfer; sends proof + encrypted note to recipient.
3. **Aggregate**: Block producer collects proofs, verifies, builds Merkle tree of new state.
4. **Commit**: Block producer posts state root to L1 (minimal data: just the root hash).
5. **Receive**: Recipient stores received note locally; can spend in future transactions.
6. **Withdraw**: User generates exit proof showing ownership; initiates L1 withdrawal (with challenge period).

## Guarantees

- **Privacy**: Transaction amounts, sender, and recipient hidden from chain observers; only commitments visible
- **Validity**: ZK proofs ensure no double-spend or inflation without revealing transaction details
- **Self-Custody**: Users control their own data; no operator can freeze or censor specific balances
- **L1 Security**: Funds secured by L1; users can always exit with valid proof

## Trade-offs

- **User Responsibility**: Users must backup their transaction data; loss means loss of funds
- **Exit Delay**: Plasma withdrawals have challenge period (typically 7 days) for fraud proofs
- **Limited Programmability**: Stateless model restricts complex contract interactions
- **Block Producer Trust**: Liveness depends on block producer; censorship possible (but not theft)
- **Client Compute**: Proof generation requires client-side resources (acceptable for institutions)

## Example

**Private Stablecoin Onboarding**

1. Institution A deposits 1M USDC to Plasma L1 contract; receives private balance commitment.
2. Institution A transfers 500K privately to Institution B; generates proof locally, sends encrypted note.
3. Block producer includes transaction in block; posts only Merkle root to L1.
4. Institution B receives note, verifies proof, stores locally.
5. On-chain observers see only: "some deposit occurred" and "state root updated" — no amounts, no parties.
6. Institution B can later withdraw to any L1 address, breaking link to original depositor.

## See also

- [Privacy L2s](pattern-privacy-l2s.md) — Alternative: native privacy rollups (Aztec)
- [Shielding](pattern-shielding.md) — Alternative: L1 shielding pools
- [L2 Encrypted Offchain Audit](pattern-l2-encrypted-offchain-audit.md) — Audit trail for compliance

## References

- Intmax (stateless Plasma): https://www.intmax.io/
- Plasma Free paper: https://eprint.iacr.org/2023/1670
- Original Plasma: https://plasma.io/

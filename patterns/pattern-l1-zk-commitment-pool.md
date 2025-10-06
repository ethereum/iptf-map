---
title: "Pattern: L1 ZK commitment pool (low volume)"
status: ready
maturity: pilot
works-best-when:
  - Low trade frequency; L2 not available or desirable.
avoid-when:
  - Active secondary markets or frequent settlements.
dependencies:
  - ERC-3643
  - ZK proof system (commitments/nullifiers)
  - ERC-7573
---

## Intent
Keep amounts/positions private on **Ethereum L1** via a **shielded pool** (commitments + nullifiers), verifying a proof per transfer; couple cash via ERC-7573.

## Ingredients
- **Standards**: ERC-3643; ERC-7573
- **Infra**: L1 contracts; prover infra
- **Off-chain**: Key mgmt; RFQ workflow

## Protocol (concise)
1. Deposit into shielded pool; receive private notes.
2. Transfers update commitments/nullifiers with ZK proofs.
3. DvP: couple to EURC via ERC-7573 (or shielded cash domain).

## Guarantees
- L1-native privacy of amounts/positions.
- Atomic DvP preserved.

## Trade-offs
- Costly per-transfer proofs; mempool privacy relies on private routing.
- Operational complexity for proofs.

## Example
- 50 trades/month; regulator requests proof for trade N; scoped reveal provided.

## See also
- pattern-dvp-erc7573.md · pattern-regulatory-disclosure-keys-proofs.md

## See also (external)
- ERC-7573 spec: https://ercs.ethereum.org/ERCS/erc-7573
- (Concept) Zcash protocol reference on notes/nullifiers: https://zips.z.cash/protocol/protocol.pdf
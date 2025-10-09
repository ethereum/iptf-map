---
title: "Pattern: Atomic DvP via ERC-7573 (cross-network)"
status: ready
maturity: pilot
works-best-when:
  - Asset and cash legs live on different networks (L1/L2).
avoid-when:
  - You rely on HTLC timeouts or manual reconciliation.
dependencies:
  - ERC-7573
  - Finality sensing/relayer
---

## Intent

Guarantee **atomic Delivery-versus-Payment** across network using **conditional-upon-transfer decryption/unlock** semantics—**no HTLC brittleness**.

## Ingredients

- **Standards**: ERC-7573 contracts on both networks
- **Infra**: Minimal relayer; finality detector
- **Off-chain**: Settlement runbooks

## Protocol (concise)

1. Escrow asset leg (bond) and cash leg (EUR stablecoin).
2. Detect cash finality; trigger asset-side unlock/decryption.
3. If any leg fails, both revert; reconcile and retry per runbook.

## Guarantees

- True cross-network atomicity; minimal information leakage.
- Deterministic failure handling.

## Trade-offs

- Requires robust finality detection and ops playbooks.
- Cross-network coordination adds complexity.

## Example

- Bond on privacy L2, EURC on L1.
- L1 finality releases L2 asset settlement; else both revert.

## See also

pattern-l2-encrypted-offchain-audit.md

## See also (external)

- ERC-7573 spec: https://ercs.ethereum.org/ERCS/erc-7573
- Discussion thread: https://ethereum-magicians.org/t/erc-7573-conditional-upon-transfer-decryption-for-delivery-versus-payment/17232

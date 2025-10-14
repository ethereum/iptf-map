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

## Protocol (Standard ERC-7573)

1. Both parties lock assets in ERC-7573 contracts on respective networks
2. Relayer monitors both networks for settlement conditions
3. Cash network finality triggers asset network unlock
4. Either both legs execute or both revert

## Privacy Extensions

Standard ERC-7573 provides atomic settlement but no privacy. For institutional use cases requiring confidentiality:

### Privacy-Preserving Coordination Methods

Here are no standard methods but approaches that could be taken.

**Trusted Relayers:**

- Institutional-grade coordination services with confidentiality agreements
- Encrypted settlement coordination without revealing trade details
- Multi-signature controls and audit trails for regulatory compliance

**MPC Relayers:**

- Decentralized multi-party computation for settlement coordination
- No single party can see complete trade information
- Threshold-based coordination with cryptographic guarantees

### Privacy Protocol Flow

1. Assets locked with encrypted parameters or in privacy domains
2. Privacy-preserving relayers coordinate without seeing trade details
3. Settlement conditions communicated via encrypted messages
4. Final execution maintains confidentiality while ensuring atomicity

## Guarantees

**Standard ERC-7573:**

- True cross-network atomicity via conditional settlement
- Deterministic failure handling and revert mechanisms
- No HTLC brittleness or timeout risks

**With Privacy Extensions:**

- Maintains atomicity while preserving transaction confidentiality
- Privacy-preserving coordination without revealing trade details
- Regulatory compliance through selective disclosure mechanisms

## Trade-offs

- Requires robust finality detection and ops playbooks.
- Cross-network coordination adds complexity.
- Privacy coordination introduces additional trust assumptions or complexity.

## Example

**Standard ERC-7573 DvP:**

- Bond on Ethereum L1, EURC payment on Polygon
- Public relayer coordinates settlement based on finality detection
- L1 bond transfer triggered by Polygon payment confirmation

## See also

- [Private Trade Settlement](../approaches/approach-private-trade-settlement.md)
- [MPC Custody](pattern-mpc-custody.md)
- [Selective Disclosure](pattern-regulatory-disclosure-keys-proofs.md)
- [ERC-7573 spec](https://ercs.ethereum.org/ERCS/erc-7573)

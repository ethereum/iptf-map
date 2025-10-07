---
title: "Pattern: Shielded ERC-20 Transfers"
status: draft
maturity: PoC
works-best-when:
  - You need confidential transfer amounts/counterparties.
  - Selective disclosure/auditing is required.
avoid-when:
  - Transparency is mandated by design.
dependencies:
  - ERC-20
  - Optional: ERC-5564 (stealth addresses), ERC-3643 (eligibility gating), EAS (audit)
---

## Intent

Enable **confidential ERC-20 transfers** by shielding balances and transfer metadata, while still allowing regulators/auditors to verify via selective disclosure (view keys, proofs).

## Ingredients

- **Standards**: ERC-20 base; optional ERC-5564 (stealth addresses), EAS for audit logs.
- **Implementations**:
  - **L1/L2 contracts** (e.g., Railgun-style shielded pools).
  - **Privacy L2/app-chains** (e.g., Aztec, Zama fhEVM, Fhenix) with native shielding.
- **Wallet/KMS**: Management of shielded keys and optional viewing keys.

## Guarantees

- Hides amounts + counterparties from non-participants.
- Enables scoped disclosures to auditors.
- Anchors commitments on L1 for integrity.

## Trade-offs

- Cost/latency of ZK/FHE proofs.
- Metadata leakage possible (timing, gas payer).
- Tooling immaturity compared to ERC-20.

## Example

- Alice shields USDC into Railgun; transfers to Bob privately; regulator later verifies the transfer via Bob’s viewing key.

## See also

- Railgun: https://docs.railgun.org/wiki
- Aztec docs: https://docs.aztec.network/
- Zama fhEVM: https://zama.ai/fhevm

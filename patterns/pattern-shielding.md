---
title: "Pattern: Shielded ERC-20 Transfers"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Confidential ERC-20 transfers hiding balances and metadata with selective disclosure
assumptions: Shielded pool contracts or privacy L2, wallet support for shielded keys
last_reviewed: 2026-01-14
works-best-when:
  - You need confidential transfer amounts/counterparties.
  - Selective disclosure/auditing is required.
avoid-when:
  - Transparency is mandated by design.
dependencies:
  - ERC-20
  - Optional: ERC-5564 (stealth addresses), ERC-3643 (eligibility gating), [Attestations](pattern-verifiable-attestation.md) for audit
---

## Intent

Enable **confidential ERC-20 transfers** by shielding balances and transfer metadata, while still allowing regulators/auditors to verify via selective disclosure (view keys, proofs).

## Ingredients

- **Standards**: ERC-20 base; optional ERC-5564 (stealth addresses)
- **Implementations**:
  - **L1/L2 contracts** (e.g., Railgun-style shielded pools, Privacy Pools with compliance-friendly association sets).
  - **Privacy L2/app-chains** (e.g., Aztec, Zama fhEVM, Fhenix) with native shielding.
- **Wallet/KMS**: Management of shielded keys and optional viewing keys.

## Protocol (concise)

1. Deposit ERC-20 tokens into shielded pool contract.
2. Receive private notes/commitments representing the deposit.
3. Execute shielded transfers by spending notes and creating new ones.
4. Generate ZK proof for each transfer (balance validity, no double-spend).
5. Optionally use stealth addresses (ERC-5564) for recipient unlinkability.
6. Provide viewing keys to auditors for selective disclosure.
7. Withdraw by proving ownership of notes and burning them.

## Guarantees

- Hides amounts + counterparties from non-participants.
- Enables scoped disclosures to auditors.
- Anchors commitments on L1 for integrity.

## Trade-offs

- Cost/latency of ZK/FHE proofs.
- Metadata leakage possible (timing, gas payer).
- Tooling immaturity compared to ERC-20.

## Example

- Alice shields USDC into Railgun; transfers to Bob privately; regulator later verifies the transfer via Bob's viewing key.

## See also

- Railgun: https://docs.railgun.org/wiki
- Aztec docs: https://docs.aztec.network/
- Zama fhEVM: https://docs.zama.org/protocol/protocol/overview
- Privacy Pools: https://privacypools.com (compliance-friendly shielded pool with association set proofs)

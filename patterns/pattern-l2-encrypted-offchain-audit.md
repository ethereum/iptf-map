---
title: "Pattern: Low-cost L2 + Off-chain Encrypted Audit Log"
status: ready
maturity: pilot
works-best-when:
  - Need hidden amounts/positions with minimal on-chain footprint.
  - Prefer cheap daily settlement over full on-chain private compute.
avoid-when:
  - Regulator demands full on-chain plaintext or off-chain infra is not feasible.
dependencies:
  - ERC-7573
  - EIP-4844
  - ERC-3643
  - EAS
  - Threshold-KMS
---

## Intent
Run on a low-cost L2; put only **commitments/hashes** on-chain; store full facts in an **append-only encrypted log**. Anchor integrity on-chain; provide auditor access via **scoped keys**; DvP via ERC-7573.

## Ingredients
- **Standards**: ERC-7573 (DvP); EAS (access logs)
- **Infra**: L2 contracts (`AuditCommit(bytes32)`); hourly Merkle-root anchor
- **Off-chain**: Encrypted records (per-trade symmetric key wrapped to threshold authorities)

## Protocol (concise)
1. RFQ/match off-chain (optionally encrypted route).
2. Write encrypted record; compute commitment; emit `AuditCommit`.
3. Anchor Merkle root periodically.
4. Escrow legs; finalize atomically via ERC-7573.
5. Regulator receives scoped view key or predicate proof; log access via EAS.

## Guarantees
- Public sees identities + commitments only; no figures leak.
- Tamper-evident audit trail via anchored roots.
- Atomic DvP; selective, auditable disclosure.

## Trade-offs
- Trust in off-chain availability/retention; mitigate with multi-region + anchors.
- Key governance overhead (rotation/re-encryption).

## Example
- A sells €5m to B; chain shows `commit` only.
- Root anchored hourly; ERC-7573 ties cash to asset.
- BaFin gets 24-hour key for that record; disclosure logged.

## See also
- pattern-dvp-erc7573.md · pattern-regulatory-disclosure-keys-proofs.md · pattern-confidential-erc20-fhe-l2-erc7573.md

## See also (external)
- ERC-7573 spec: https://ercs.ethereum.org/ERCS/erc-7573
- EIP-4844 (blobs): https://eips.ethereum.org/EIPS/eip-4844
- EAS docs: https://easscan.org/docs
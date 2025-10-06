---
title: "Pattern: Selective disclosure (viewing keys + ZK proofs)"
status: ready
maturity: pilot
works-best-when:
  - Regulator needs targeted visibility without blanket transparency.
avoid-when:
  - Policy requires full public plaintext.
dependencies:
  - EAS
  - Threshold-crypto/KMS
  - ZK predicate circuits
---

## Intent
Provide **on-demand, scoped visibility** into confidential trades/positions via **threshold-controlled viewing keys** and/or **ZK proofs** answering regulator questions.

## Ingredients
- **Standards**: EAS for access logging
- **Infra**: Threshold KMS, policy engine
- **Off-chain**: Request/approval workflow; audit storage

## Protocol (concise)
1. Regulator requests scope (account/ISIN/time).
2. Policy engine checks mandate; emits EAS access-grant.
3. Assemble **time-limited viewing key** or produce **ZK proof**.
4. Deliver result; log disclosure (hash + who/when).

## Guarantees
- Least-privilege, revocable access; full audit trail.
- Zero-knowledge responses when raw data isn’t needed.

## Trade-offs
- Operational complexity (key custody/rotation).
- Proof authoring/UX requires discipline.

## Example
- BaFin asks for Jan-15 trades in ISIN X.
- System issues 24-hour read token; EAS logs event; auto-revokes.

## See also
- pattern-confidential-erc20-fhe-l2-erc7573.md · pattern-l2-encrypted-offchain-audit.md

## See also (external)
- EAS docs: https://easscan.org/docs
- EAS contracts: https://github.com/ethereum-attestation-service/eas-contracts

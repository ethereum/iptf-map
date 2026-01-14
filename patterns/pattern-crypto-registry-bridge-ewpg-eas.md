---
title: "Pattern: Crypto-register bridge (eWpG) with EAS mirroring"
status: ready
maturity: pilot
layer: hybrid
privacy_goal: Mirror licensed crypto-register facts on-chain as attestations without exposing PII
assumptions: Licensed crypto-register (eWpG), EAS infrastructure, registrar API access
last_reviewed: 2026-01-14
works-best-when:
  - Germany/eWpG applies and a licensed crypto-register is required.
avoid-when:
  - You can legally replace the register on day one.
dependencies:
  - eWpG policy
  - EAS
---

## Intent
Operate with a licensed **crypto-register** today while **mirroring key facts** (issuance, transfers, liens) as **on-chain attestations** to anchor integrity and pave automation.

## Ingredients
- **Standards**: EAS schemas for legal facts
- **Infra**: Registrar API integration
- **Off-chain**: Notarized records; NDA-regulated reveal process

## Protocol (concise)
1. Registrar records legal event; emits signed record.
2. Middleware posts an **EAS attestation hash** (no PII) on-chain.
3. Audits: match registrar record ↔ on-chain anchor.

## Guarantees
- Legal compliance now; cryptographic anchors for later automation.
- Tamper-evident record linkage.

## Trade-offs
- Two sources of truth; reconciliation required.
- Strong incident/runbook discipline.

## Example
- Issuance logged by registrar; hash anchored on-chain; auditor verifies hash match later.

## See also
- pattern-regulatory-disclosure-keys-proofs.md · pattern-icma-bdt-data-model.md

## See also (external)
- BaFin on eWpG: https://www.bafin.de/EN/PublikationenDaten/Fachartikel/2021/fa_bj_2107_eWpG_en_en.html
- BaFin · Crypto-securities register: https://www.bafin.de/EN/Aufsicht/FinTech/Geschaeftsmodelle/DLT_Blockchain_Krypto/Kryptowertpapierregisterfuehrung/Wertapierregister_node_en.html
- EAS docs: https://easscan.org/docs
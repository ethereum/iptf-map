---
title: "Pattern: ICMA Bond Data Taxonomy (canonical terms/events)"
status: ready
maturity: prod
works-best-when:
  - You want machine-readable bond terms/events across tools.
avoid-when:
  - N/A (use as a baseline; extend as needed)
  - ICMA is not the schema being used for a particular jurisdiction/domain
dependencies:
  - ICMA BDT schema
---

## Intent
Use **ICMA Bond Data Taxonomy** as the canonical schema for bond terms & lifecycle events to avoid fragmentation and enable clean attestations/proofs.

## Ingredients
- **Standards**: ICMA BDT
- **Infra**: Schema loader/validator; compression (XML→binary)
- **Off-chain**: Mapping to registrar records; EAS hash anchoring

## Protocol (concise)
1. Author terms/events in BDT.
2. Validate; compress; store (on/off-chain hash).
3. Use same schema in proofs/disclosures.

## Guarantees
- Interop-ready, regulator-friendly data.
- Easier proofs/attestations.

## Trade-offs
- Up-front mapping effort to existing systems.

## Example
- Issuance terms in BDT; hash anchored via EAS; regulator verifies consistency.

## See also
- pattern-crypto-registry-bridge-eWpG-eas.md

## See also (external)
- ICMA BDT overview: https://www.icmagroup.org/fintech-and-digitalisation/fintech-advisory-committee-and-related-groups/bond-data-taxonomy/
- BDT factsheet (PDF): https://www.icmagroup.org/assets/documents/Regulatory/FinTech/Bond-data-taxonomy/ICMA-Bond-Data-Taxonomy-BDT-Factsheet-March-2023-140323.pdf
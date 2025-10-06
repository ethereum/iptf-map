---
title: "Domain: Trading"
status: draft
---

## TLDR
- Execution privacy: RFQ intent/size/price, pre-trade leakage control.
- Cross-domain atomicity (DvP/PvP) without HTLCs; optional zk-SPV for strong atomicity.

## Primary use cases
- Private DvP (`/use-cases/use-case-private-dvp.md`)

## Related use cases (secondary)
- Private Bonds (`/use-cases/use-case-private-bonds.md`)

## Shortest-path patterns
- Pre-trade privacy (Shutter/SUAVE) (`/patterns/pattern-pretrade-privacy-shutter-suave.md`)
- Atomic DvP via ERC-7573 (`/patterns/pattern-dvp-erc7573.md`)
- ZK Shielded Balances (`/patterns/pattern-zk-shielded-balances.md`)
- zk-SPV (cross-chain) (`/patterns/pattern-zk-spv.md`)
- Commit-and-Prove fallback (`/patterns/pattern-commit-and-prove.md`)

## Adjacent vendors
- Renegade (`/vendors/renegade.md`)
- Aztec L2 (`/vendors/aztec-l2.md`)
- Railgun (`/vendors/railgun.md`)
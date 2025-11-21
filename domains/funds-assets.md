---
title: "Domain: Funds & Assets"
status: draft
---

## TLDR
- Asset lifecycle: issuance, transfers, registry linkages, portfolio moves.
- Hide amounts/positions; preserve DvP finality; bridge legal records via attestations.
- Derivatives: daily deltas/margins hidden; regulator replayable audit.
- Pick cheapest viable privacy that meets audit needs; measure costs under 4844.

## Primary use cases
- [Private Bonds](../use-cases/private-bonds.md)
- [Private RWA Tokenization](../use-cases/private-rwa-tokenization.md)
- [Private Smart Derivatives (ERC-6123)](../use-cases/private-derivatives.md)

## Shortest-path patterns
- Confidential ERC-20 on privacy L2 (FHE) + ERC-7573 (`/patterns/pattern-confidential-erc20-fhe-l2-erc7573.md`)
- [L1 ZK commitment pool](../patterns/pattern-l1-zk-commitment-pool.md)
- [Crypto-registry bridge (eWpG) + EAS](../patterns/pattern-crypto-registry-bridge-eWpG-eas.md)
- [ICMA Bond Data Taxonomy](../patterns/pattern-icma-bdt-data-model.md)
- [ZK proof of derivative delta](../patterns/pattern-zk-derivative-delta.md)
- [Selective disclosure (view keys + proofs)](../patterns/pattern-regulatory-disclosure-keys-proofs.md)

## Adjacent vendors
- [Kaleido Paladin](../vendors/paladin.md)
- [Aztec L2](../vendors/aztec-l2.md)
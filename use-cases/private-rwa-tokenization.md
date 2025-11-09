---
title: Private RWA Tokenization
primary_domain: Funds & Assets
secondary_domain:
---

## 1) Use Case

Regulated real-world assets (RWAs) are tokenized on-chain to enable permissioned transfers of ownership and co-ownership. The solution requires private pricing and valuation with full history, unlinkable ownership and transfer histories, exportable ownership with accreditation proofs, and policy enforcement based on attestations with regulatory intervention capabilities.

## 2) Additional Business Context

**See confidential context:** [context/use-cases/context-private-rwa-tokenization.md](../../context/use-cases/context-private-rwa-tokenization.md)

### Market Signals

- **Market size:** Total RWA Value at $15.801b (Sep 2025, [Defillama](https://defillama.com/protocols/RWA))
- **Growth:** 245× growth from $85M (April 2020) to $21B (April 2025) - [Coinbase Report](https://assets.ctfassets.net/sygt3q11s4a9/6oinXHvVekdIUw2Ch7yIQw/22d0185eba3c49322ce7cf0d287ea872/SOCQ2Report_final.pdf)
- **Asset distribution:** Private credit (61%), Treasuries (30%), Commodities (7%), Institutional funds (2%)
- **Deployed categories:** [US Treasuries](https://app.rwa.xyz/treasuries), [Global Bonds](https://app.rwa.xyz/global-bonds), [Private Credits](https://app.rwa.xyz/private-credit), [Commodities](https://app.rwa.xyz/commodities), [Institutional Funds](https://app.rwa.xyz/institutional-funds), [Stocks](https://app.rwa.xyz/stocks)

## 3) Actors

Identity Provider (onchain identities for issuers, investors, authorized regulators) · Oracle (compliance checks) · Issuer (financial institutions, authorized registrar) · Investor · Regulator (policy enforcement, intervention capabilities)

## 4) Problems

### Problem 1: Privacy-Preserving RWA Tokenization with Regulatory Compliance

On-chain RWA tokenization exposes ownership, valuation, and transfer history by default, conflicting with institutional privacy requirements and competitive positioning. The solution must provide ownership privacy with unlinkable transfer histories while maintaining selective disclosure and enforcement capabilities.

**Requirements:**

- **Must hide:** who owns the RWA (and amount if not NFT), history of ownership, value if NFT
- **Public OK:** asset existence; contract code; compliance schema; [attestation](../patterns/pattern-verifiable-attestation.md) framework
- **Regulator access:** selective disclosure of trade info such as owner id, amount/value of RWA, and pause/freeze RWA (granularity varies by jurisdiction)
- **Settlement:** atomic DvP
- **Ops:** N/A

**Constraints:**

- Cannot break existing regulatory frameworks
- Must support authorized identity issuance and management
- Must provide auditability and accountability for [attestations](../patterns/pattern-verifiable-attestation.md) and issuer solvency

## 5) Recommended Approaches

See [Private Bonds](../approaches/approach-private-bonds.md) and [Private Payments](../approaches/approach-private-payments.md) approaches - RWA tokenization can inherit private transfer solutions with emphasis on transfer compliance checks and RWA-specific standards (ERC-3643, ERC-7943 with privacy modifications using commitments).

## 6) Open Questions

- N/A

## 7) Notes And Links

- **Patterns:**
  - [pattern-aztec-privacy-l2-erc7573.md](../../patterns/pattern-aztec-privacy-l2-erc7573.md)
  - [pattern-l2-encrypted-offchain-audit.md](../../patterns/pattern-l2-encrypted-offchain-audit.md)
  - [pattern-zk-kyc-ml-id-erc734-735.md](../../patterns/pattern-zk-kyc-ml-id-erc734-735.md)
  - [pattern-co-snark-compliance-check.md](../../patterns/pattern-co-snark-compliance-check.md)
- **Standards:** ERC-3643, ERC-7943

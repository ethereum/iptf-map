---
title: Private Bonds
primary_domain: Funds & Assets
secondary_domain:
---

## 1) Use Case

Institutional bond issuance and trading on public blockchains where volumes, prices, and positions must remain confidential to prevent front-running and strategy exposure. The solution requires confidential amounts and positions with selective regulator visibility, atomic delivery-versus-payment (DvP) settlement, while maintaining public-chain finality and economically viable daily settlement cycles.

## 2) Additional Business Context

**See confidential context:** [context/use-cases/context-private-bonds.md](../../context/use-cases/context-private-bonds.md)

## 3) Actors

Issuer · Investors · Crypto-Registry · Regulator · Oracles (valuation, payment) · Settlement venues (stablecoin network)

## 4) Problems

### Problem 1: Transaction Privacy with Regulatory Compliance

Public chains expose volumes, prices, and positions by default, enabling front-running and competitive intelligence gathering. Institutions require transaction-level confidentiality while maintaining selective disclosure for regulatory compliance.

**Requirements:**

- **Must hide:** amounts, positions, trade details (issuance + secondary); ideally RFQ/order size pre-inclusion
- **Public OK:** legal entity identities; existence of transactions/events (no figures)
- **Regulator access:** scoped viewing keys and/or ZK proofs; access logging ([attestations](../patterns/pattern-verifiable-attestation.md))
- **Settlement:** atomic DvP; minutes-level finality acceptable; **daily** cycles
- **Ops:** predictable **L2** costs (post-4844), append-only encrypted audit log with on-chain anchors; key rotation & retention policies

**Constraints:**

- Regulatory compliance (crypto-register integration where required)
- Production timeline: **1–2 years**
- Avoid HTLC brittleness
- Infrastructure costs viable during adoption phase

## 5) Recommended Approaches

See detailed solution architecture and trade-offs in [**Approach: Private Bonds**](../approaches/approach-private-bonds.md).

**PoC Implementation:** [Private Tokenised Bonds](https://github.com/Meyanis95/private-tokenised-bonds) — UTXO shielded bond issuance with JoinSplit circuits.

## 6) Open Questions

_Notes below reference the PoC implementation._

- Secondary market: RFQ model + pre-trade privacy requirements (what must be hidden?)
  - _PoC approach:_ Issuer acts as relayer and can serve as market matcher; peer-to-peer RFQ not in scope
- Minimum viable privacy: amounts/positions only vs parts of the term sheet?
  - _PoC approach:_ Amounts and positions hidden; legal entity identities can remain public (dual identity model)
- ISO 20022 relevance for bond workflows vs ICMA BDT usage

## 7) Notes And Links

- **Umbrella issue:** https://github.com/iptf-eth/iptf-pm/issues/4
- **Standards:** EIP-6123 (derivative/bond lifecycle), ERC-7573 (atomic cross-domain DvP), ICMA Bond Data Taxonomy (BDT)
- **Current standards:** ERC-20 tokens; HTLC sequences for DvP (to be replaced by ERC-7573)

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

**TODO: Refactor these approaches into approaches/ folder following template**

### Top Candidates
1. [Confidential ERC-20 on privacy L2 + ERC-7573](../../patterns/pattern-confidential-erc20-fhe-l2-erc7573.md) — identities public, **amounts private** on-chain; atomic DvP; fits daily cost profile
2. [L2 + Off-chain Encrypted Audit](../../patterns/pattern-l2-encrypted-offchain-audit.md) — minimal on-chain data (commitments); encrypted append-only log; auditor keys; **cheapest MVP**
3. [Programmable-privacy L2 (Aztec) + ERC-7573](../../patterns/pattern-aztec-privacy-l2-eip7573.md) — native private notes & viewing keys; **timeline risk**
4. [L1 ZK Commitment Pool](../../patterns/pattern-l1-zk-commitment-pool.md) — L1 fallback for **very low volume**; higher per-trade cost; weaker pre-trade privacy

### Non-Solutions
- **Railgun/mixers** — optional keys; no bond lifecycle/DvP semantics; compliance optics
- **Private chains only** — consortium peers can still infer flows; lose public-chain finality/composability
- **Simple encryption / delayed reporting** — can't compute/audit in real time
- **Fully off-chain** — forfeits atomicity/automation benefits

## 6) Open Questions
- Secondary market: RFQ model + pre-trade privacy requirements (what must be hidden?)
- Minimum viable privacy: amounts/positions only vs parts of the term sheet?
- ISO 20022 relevance for bond workflows vs ICMA BDT usage

## 7) Notes And Links
- **Umbrella issue:** https://github.com/iptf-eth/iptf-pm/issues/4
- **Standards:** EIP-6123 (derivative/bond lifecycle), ERC-7573 (atomic cross-domain DvP), ICMA Bond Data Taxonomy (BDT)
- **Current standards:** ERC-20 tokens; HTLC sequences for DvP (to be replaced by ERC-7573)

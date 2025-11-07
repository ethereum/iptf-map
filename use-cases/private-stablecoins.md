---
title: Private Stablecoins for Institutional Payments
primary_domain: Payments
secondary_domain:
---

## 1) Use Case

Institutions want to use stablecoins as settlement cash without exposing amounts, counterparties, or workflow metadata to non-participants. The solution requires stakeholder-only visibility with selective disclosure and atomic settlement capabilities with assets.

**Note:** In jurisdictions where stablecoins are restricted, these same privacy patterns apply to authorized digital currencies (e.g., CBDCs, tokenized deposits).

## 2) Additional Business Context

**See confidential context:** [context/use-cases/context-private-stablecoins.md](../../context/use-cases/context-private-stablecoins.md)

## 3) Actors

Payer/Payee (banks, dealers, buy-side) · Stablecoin Issuer/Admin · Execution Venue · Post‑trade/Market Infrastructure (custody/CSD/clearing) · Regulator/Auditor · Compliance/Monitoring · Custodians/Prime Brokers · Oracles/Reference Data

## 4) Problems

### Problem 1: Payment Privacy with Regulatory Compliance

Public-by-default ledgers leak strategy and order flow and conflict with institutional confidentiality and compliance obligations. Institutions need stakeholder-only visibility with selective disclosure and atomic settlement with assets.

**Requirements:**

- **Must hide:** transfer **amounts**, **payer/payee identities to non-participants**, and **memos/workflow metadata**; optionally timing/ordering leakage minimised
- **Public OK:** existence of a transaction/anchor; contract code; allow-list membership proofs (no PII); attestation schemas
- **Regulator access:** **scoped viewing keys** and/or **[attestations](../patterns/pattern-verifiable-attestation.md)** with **access logging**; revocation & rotation policies
- **Settlement:** **Atomic DvP/PvP** across cash↔asset or cash↔cash using [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) semantics; minutes‑level finality OK for pilot
- **Ops:** predictable L2 costs; encrypted audit log with L1 anchors; issuer controls (freeze/blacklist) where mandated; KYC holder gating (e.g., [ERC‑3643](https://eips.ethereum.org/EIPS/eip-3643))

**Constraints:**

- **Performance:** Throughput/latency/finality **must be measured** on chosen Ethereum stack (no reliance on vendor claims)
- **Regulatory:** Must not weaken KYC/AML/sanctions, reporting, or books‑and‑records per local jurisdiction requirements
- **Interoperability:** Avoid vendor lock‑in; standardised APIs/bridges; production migration path

## 5) Recommended Approaches

See detailed solution architecture and trade-offs in [**Approach: Private Payments**](../approaches/approach-private-payments.md).

**Jurisdiction-Specific Implementations:**

- **China:** Apply these patterns to e-CNY (Digital Yuan) infrastructure through approved BSN channels
- **EU/US:** Licensed stablecoins under MiCA/GENIUS frameworks
- **Hong Kong:** SFC-licensed digital payment token services

### Non‑Solutions

- **Public ledger without privacy** — transaction details exposed to all observers; fails institutional confidentiality requirements
- **Simple payload encryption** — breaks on-chain verifiability, atomic settlement, and composability with other protocols
- **HTLC-only atomicity** — incentive misalignment and timeout brittleness compared to conditional settlement standards like ERC‑7573 ([analysis](https://www.ndss-symposium.org/wp-content/uploads/2023-775-paper.pdf))
- **Fully private infrastructure** — conflicts with regulatory transparency requirements and limits interoperability
- **FHE alone for unlinkability** — provides confidentiality but does not hide address linkage; requires additional privacy layer (stealth addresses or similar)

## 6) Open Questions

- Minimum viable privacy set (amounts+counterparties only vs timestamps/order flow)?
- Regulator access model (who, what scope, revocation path, SLAs)?
- Custody→token binding and settlement finality sensing across domains?
- L1 anchoring cadence and metadata leakage analysis

## 7) Notes And Links

- **Standards & Infrastructure:** [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) · [ERC‑3643](https://eips.ethereum.org/EIPS/eip-3643) · [ERC‑5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564) · [Aztec](https://docs.aztec.network/) · [Zama fhEVM](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption) · [Fhenix](https://www.fhenix.io/)
- **Regulatory Frameworks (jurisdiction-specific):** see [jurisdiction](../jurisdictions/)
- **Technical Note on Privacy:** FHE implementations (Fhenix, Zama fhEVM) encrypt data-in-use providing **confidentiality** but **not unlinkability**. To hide address linkage and prevent transaction graph analysis, combine with **[ERC-5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564)** or equivalent unlinkability mechanisms.

### Related patterns

- `../../patterns/pattern-dvp-erc7573.md`
- `../../patterns/pattern-l2-encrypted-offchain-audit.md`
- `../../patterns/pattern-aztec-privacy-l2-erc7573.md`
- `../../patterns/pattern-confidential-erc20-fhe-l2-erc7573.md`
- `../../patterns/pattern-private-stablecoin-shielded-payments.md`
- `../../patterns/pattern-private-pvp-stablecoins-erc7573.md`
- `../../patterns/pattern-iso20022.md`

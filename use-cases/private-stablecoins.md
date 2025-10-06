---
title: Private Stablecoins for Institutional Payments
primary_domain: Payments
secondary_domain:
---

## 1) Use Case
Institutions want to use stablecoins as settlement cash without exposing amounts, counterparties, or workflow metadata to non-participants. The solution requires stakeholder-only visibility with selective disclosure and atomic settlement capabilities with assets.

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
- **Regulator access:** **scoped viewing keys** and/or **ZK/EAS attestations** with **access logging**; revocation & rotation policies. See [EAS](https://attest.org/)
- **Settlement:** **Atomic DvP/PvP** across cash↔asset or cash↔cash using [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) semantics; minutes‑level finality OK for pilot
- **Ops:** predictable L2 costs; encrypted audit log with L1 anchors; issuer controls (freeze/blacklist) where mandated; KYC holder gating (e.g., [ERC‑3643](https://eips.ethereum.org/EIPS/eip-3643))

**Constraints:**
- **Performance:** Throughput/latency/finality **must be measured** on chosen Ethereum stack (no reliance on vendor claims)
- **Regulatory:** Must not weaken KYC/AML/sanctions, reporting, or books‑and‑records under **MiCA** and **GENIUS**
- **Interoperability:** Avoid vendor lock‑in; standardised APIs/bridges; production migration path

## 5) Recommended Approaches

**TODO: Refactor these approaches into approaches/ folder following template**

### Top Candidates
1. **Private Stablecoin Shielded Payments (privacy L2/FHE + Stealth Addresses)** — Stakeholder-only visibility for cash leg; selective disclosure; Ethereum-native. FHE does not hide sender/receiver identities; complement with [ERC-5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564) to hide on-chain linkage
2. **Atomic DvP via ERC‑7573 (cross‑network)** — Standards‑based atomicity (no HTLC brittleness) for cash↔asset
3. **L2 + Encrypted Off‑chain Audit** — Minimal on‑chain commitments + append‑only encrypted log; cheapest MVP
4. **Programmable‑Privacy L2 (Aztec) + ERC‑7573** — Native private notes & viewing keys; strong semantics, timeline risk until mainnet ([Aztec docs](https://docs.aztec.network/))
5. [**Private ISO20022 transfer**](../../patterns/pattern-private-iso20022.md) - Private stablecoins exchange using SWIFT rails

### Non‑Solutions
- **Public chain "as‑is"** — amounts/flows exposed; fails confidentiality
- **Simple payload encryption** — breaks on‑chain verifiability/composability
- **HTLC‑only atomicity** — incentive/timeout brittleness vs ERC‑7573 ([analysis](https://www.ndss-symposium.org/wp-content/uploads/2023-775-paper.pdf))
- **Private chain as core** — misaligned with Ethereum‑first and broad interop
- **FHE alone for anonymity** — does not hide identities; requires stealth/address-privacy layer

## 6) Open Questions
- Minimum viable privacy set (amounts+counterparties only vs timestamps/order flow)?
- Regulator access model (who, what scope, revocation path, SLAs)?
- Custody→token binding and settlement finality sensing across domains?
- L1 anchoring cadence and metadata leakage analysis

## 7) Notes And Links
- **Standards & infra:** [ERC‑7573](https://ercs.ethereum.org/ERCS/erc-7573) · [ERC‑3643](https://eips.ethereum.org/EIPS/eip-3643) · [EAS](https://attest.org/) · [ERC‑5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564) · [Aztec](https://docs.aztec.network/) · [Zama fhEVM](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption) · [Fhenix](https://www.fhenix.io/)
- **Policy:** **MiCA** (EUR‑Lex: [2023/1114](https://eur-lex.europa.eu/eli/reg/2023/1114/oj/eng)) · **GENIUS Act** ([White House](https://www.whitehouse.gov/briefing-room/statements-releases/2025/07/16/fact-sheet-the-genius-act-with-a-path-to-a-safe-and-secure-u-s-digital-asset-framework/))
- **FHE anonymity caveat:** **Fhenix** adopts **Zama's fhEVM**; both encrypt data-in-use but **do not provide sender/receiver anonymity**. Pair with **[ERC-5564 Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564)** (or equivalent) to hide payer/payee identities

### Related patterns
- `../../patterns/pattern-dvp-erc7573.md`
- `../../patterns/pattern-l2-encrypted-offchain-audit.md`
- `../../patterns/pattern-aztec-privacy-l2-erc7573.md`
- `../../patterns/pattern-confidential-erc20-fhe-l2-erc7573.md`
- `../../patterns/pattern-private-stablecoin-shielded-payments.md`
- `../../patterns/pattern-private-pvp-stablecoins-erc7573.md`
- `../../patterns/pattern-iso20022.md`

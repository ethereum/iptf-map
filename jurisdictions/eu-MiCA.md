---
title: "Jurisdiction: EU / MiCA"
status: draft
region: EU
scope:
  entities:
    [institutions, custodians, CASPs, issuers (ART/EMT/other), trading venues]
  activities:
    [
      issuance,
      custody,
      trading/venue ops,
      payments/stablecoins,
      staking,
      data/oracles,
    ]
key-regulations:
  - MiCA (Reg. (EU) 2023/1114) — ART/EMT from 2024-06-30; CASP rules from 2024-12-30
  - EU Transfer of Funds Regulation “Travel Rule” (applies to crypto by 2024-12-31)
  - DORA (EU 2022/2554) — ICT risk, applicable from 2025-01-17
---

## At a Glance

The EU provides a **single passport** under **MiCA** for **Crypto-Asset Service Provider (CASPs)** and **token issuers** with detailed, prescriptive rules. Stablecoins (**Asset-Referenced Tokens (ARTs)/E-Money Tokens (EMTs)**) were the **first phase** (mid-2024); **CASP** obligations (authorisation, conduct, prudential, governance) apply from **2024-12-30**. Expect **strict AML “travel rule”** enforcement and **DORA**-grade operational resilience for in-scope entities.

## Core Compliance Expectations

- **Registration / licensing:** Obtain **CASP authorisation** with your National Competent Authority (NCA); issuers of **ART/EMT** require authorisation/approval under MiCA (with EBA/ESMA RTS/ITS). Passport across EU once authorised.
- **KYC/AML:** Apply **EU “travel rule”** for crypto transfers (originator/beneficiary data) and screen counterparties; implement sanction screening.
- **Disclosure / reporting:** White papers, ongoing disclosures; ART/EMT reporting (esp. **non-EUR-denominated**) via European Banking Authority (EBA) templates.
- **Custody rules:** Safeguarding, segregation, liability and governance under MiCA; plus **DORA** ICT-risk controls if in scope.

## Actionable Best Practices

### Payments

- **Onboard only MiCA-authorised ART/EMT issuers.** Verify authorisation and, for significant tokens, enhanced EBA oversight. Keep a **counterparty evidence pack** (authorisation number, reporting status, reserve/collateral methodology).
- **Implement Travel-Rule orchestration.** Enforce data capture and secure transmission for all crypto transfers with **policy fallbacks** (hold/return rules when VASP data missing). Log mismatches to an **AML case system**.
- **FX/stability risk routines for non-EUR stablecoins.** Incorporate EBA **non-EU-currency** ART/EMT reporting templates; monitor thresholds that could trigger “significant” classification.

### Trading

- **CASP authorisation playbook.** Prepare **governance, prudential, Information and Communications Technology (ICT) architecture, conflicts, market-abuse surveillance** and **DORA** alignment before filing. Expect NCAs to probe business model controls and ICT third-party risk.
- **Listing & marketing controls.** Classify assets (MiCA crypto-asset vs. MiFID financial instrument); don’t imply MiCA coverage where it doesn’t apply (ESMA warned on **misleading status**). Maintain **delisting triggers** and **marketing pre-clearance**.
- **Reverse-solicitation guardrails.** Implement geo-fencing and onboarding attestations; keep **audit logs** to substantiate any reverse-solicitation claims. (ESMA reverse-solicitation guidance.)

### Funds & Assets

- **Product governance & disclosure.** Use MiCA white-paper standards for public offers/admissions; align with ESMA knowledge/competence rules for client-facing staff. Build a **disclosure pack** (risks, fees, technology, reserves/attestations).
- **Custody & segregation for asset-backed products.** If structuring notes/ETNs off-chain, ensure underlying crypto custody meets MiCA + DORA expectations (incident reporting, TLPT readiness).

### Custody

- **Safeguarding by design.** Segregate client assets on-chain and in books & records; publish **asset-location attestations**; define **compensating-transaction** procedures for error remediation (no history edits) with dual approval.
- **DORA compliance stack.** Maintain **ICT risk management**, incident reporting, threat-led penetration testing (**TLPT**), and **third-party risk registers** for wallet infra, node providers, and custodial HSMs.
- **Key-management resilience.** Dual-control ops, MPC/HSM with **break-glass** and **key-compromise runbooks**; map all critical providers into DORA **Register of Information**.

### Identity & Compliance

- **KYC lifecycle.** Risk-based Customer Due Diligence (CDD)/Enhanced Due Diligence (EDD); verify **beneficial ownership**; monitor **source of funds**; Travel-Rule integration at transfer initiation + screening on receipt.
- **Competence & conduct.** Train client-facing staff to ESMA **knowledge/competence** standards; keep training logs and assessment evidence for NCAs.
- **Marketing fairness.** Prominent risk warnings; **no “implied MiCA insurance”**; maintain NCA-ready archives of all communications.

### Data & Oracles

- **Oracle due diligence.** Document selection, governance, fallbacks and dispute procedures; record **data lineage** for Net Asset Value (NAV)/pricing if feeding regulated disclosures.
- **Outsourcing oversight.** If using oracle or index vendors, include **DORA-compliant contractual clauses** (SLAs, audit rights, incident notices, subcontracting).

## Key Risks to Watch

- **Misclassification** (MiCA crypto-asset vs. MiFID financial instrument) → triggers the wrong regime.
- **Marketing/mis-selling** under MiCA (ESMA scrutiny of CASPs overstating regulatory cover).
- **Operational resilience gaps** (DORA audits: ICT third-party risk, TLPT, registers of information).

## Enterprise Opportunities

- **EU-wide passport** after one authorisation (scales distribution across 27 states).
- **Stablecoin rails** with authorised **ART/EMT** issuers (bank-grade governance; clearer onboarding for pay/settlement use cases).
- **Professionalised sales & support** (ESMA competence rules) as a differentiator for institutional clients.

## See Also

- [MiCA Regulation (EU 2023/1114) – EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1114/oj)
- [European Commission – MiCA Overview](https://finance.ec.europa.eu/regulation-and-supervision/financial-services-legislation/markets-crypto-assets-mica_en)
- [EBA – MiCA Technical Standards for ARTs/EMTs](https://www.eba.europa.eu/regulation-and-policy/crypto-assets)
- [ESMA – Role of National Competent Authorities (NCAs)](https://www.esma.europa.eu/about-esma/national-competent-authorities)
- [Digital Operational Resilience Act (DORA, EU 2022/2554) – EUR-Lex](https://eur-lex.europa.eu/eli/reg/2022/2554/oj)
- [European Commission – DORA Explainer](https://finance.ec.europa.eu/regulation-and-supervision/financial-services-legislation/digital-operational-resilience_en)
- [FATF Glossary – Customer Due Diligence (CDD)](https://www.fatf-gafi.org/en/glossary/c.html)

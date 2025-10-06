---
title: "Jurisdiction: US / SEC"
status: draft
region: US
scope:
  entities: [institutions, custodians, exchanges/ATS, asset managers, issuers]
  activities: [issuance, custody, staking, stablecoins, ETPs]
key-regulations:
  - SEC Framework for “Investment Contract” Analysis of Digital Assets (2019)
  - SEC approval of generic listing standards for commodity-based ETPs (2025-09)
  - SEC Staff Statement on Certain Protocol Staking Activities (2025-05)
  - GENIUS Act (2025) — US federal stablecoin law
---

## At a Glance

The SEC is generally **restrictive but evolving**. Crypto assets deemed securities must follow full registration and disclosure rules. Recent clarity has emerged:

- **Stablecoins** now federally regulated under the **GENIUS Act (Jul 2025)**.
- **Spot commodity-based ETPs** (including crypto assets) can use **generic listing standards** (Sep 2025).
- **Protocol-level staking** clarified as _not_ always a securities transaction (May 2025, staff statement).

## Core Compliance Expectations

- **Registration / licensing**: Issuers, ATS/exchanges, broker-dealers, advisers.
- **KYC/AML**: BSA obligations via FinCEN; practically required for all institutional platforms.
- **Disclosure / reporting**: Prospectuses, periodic filings, public risk disclosures.
- **Custody rules**: Client assets must be segregated; use qualified custodians; SOC 2 / ISO 27001 audits.

## Actionable Best Practices

### Payments

- Treat **stablecoin issuers** as regulated financial entities under the **GENIUS Act**.
- Enterprises integrating stablecoins should **only support GENIUS-compliant issuers**, request proof of reserves, and verify capital/liquidity compliance.
- Build **counterparty risk assessment processes** before onboarding a new stablecoin.

### Trading

- Exchanges/ATS must **register** or operate under exemption; ensure **surveillance-sharing agreements** for listed tokens.
- For token listings: run a **Howey test** and document rationale; implement delisting protocols for high-risk assets.
- Build internal **market manipulation monitoring** aligned with SEC expectations.

### Funds & Assets

- Use the **generic listing standards** for ETPs where possible; confirm surveillance and liquidity criteria.
- Prepare **institution-grade disclosure packages** for investors (fees, risks, asset quality).
- For asset managers: coordinate early with SEC staff; avoid launching products without registration.

### Custody

- Maintain **segregated client accounts** and independent audit trails.
- Implement **compensating transaction protocols** for error/fraud reversals without rewriting history.
- Adopt **qualified custodian** controls (as per SEC custody rule proposals): insurance, cold storage, disaster recovery.

### Identity & Compliance

- Onboard users with **BSA/AML-compliant KYC** (customer ID, source of funds).
- Maintain **record-keeping systems** aligned with Exchange Act.
- Build **compliance dashboards** for regulators to ease audits.

### Data & Oracles

- When providing price feeds, use **regulated benchmarks** where available.
- Document **oracle governance** (who controls, fallback mechanisms).
- Be ready to provide **transparency reports** if data influences regulated products (e.g., ETP NAVs).

## Key Risks to Watch

- **Liquid staking**: still under scrutiny, commissioners split.
- **NFTs & DeFi**: not formally addressed, likely enforcement-driven.
- **Dual oversight**: SEC vs. CFTC jurisdiction overlaps unresolved.

## Enterprise Opportunities

- **Stablecoins**: Federal law (GENIUS Act) opens door to mainstream integration.
- **ETPs/ETFs**: Generic listing standards cut approval time, enabling new asset classes.
- **Staking**: Clarity reduces validator risk, though staking-as-a-service remains grey.

## See Also

- [White House Digital Assets Report (EO14178, July 2025)](https://whitehouse.gov/wp-content/uploads/2025/07/Digital-Assets-Report-EO14178.pdf)
- [SEC Written Proposal: Digital Asset Regulation (Sep 2025)](https://www.sec.gov/files/ctf-written-sec-proposal-digital-asset-09-08-2025.pdf?utm_source=substack&utm_medium=email)

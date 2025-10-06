---
title: "Jurisdiction: DE / eWpG (Electronic Securities Act)"
status: draft
region: EU / Germany
scope:
  entities: [issuers, custodians, registrars, trading venues]
  activities:
    [on-chain issuance, registry operations, custody, secondary trading]
key-regulations:
  - eWpG (Gesetz über elektronische Wertpapiere, 2021–)
  - BaFin licensing for crypto-securities registrars & custody
---

## At a Glance

Germany’s **eWpG** lets you issue **electronic securities** (including **crypto-securities**) with legal equivalence to paper certificates, recorded either in a **central electronic register** or a **crypto-securities register**. Operating the crypto register and providing crypto custody are **regulated BaFin activities**.

## Core Compliance Expectations

- **Registration / licensing:** Operating a **crypto-securities register** requires authorisation; **crypto custody** is a separate licence.
- **Disclosure / reporting:** Issuers must meet prospectus & corporate law duties; registrars maintain accurate, tamper-evident records.
- **Governance & liability:** Clear operator accountability for register accuracy, availability, and change controls.

## Actionable Best Practices

### Funds & Assets (Issuance)

- Use **DLT-native issuance** only after a legal opinion confirms the instrument qualifies under eWpG.
- Maintain a **golden-source issuance file** (terms, ISIN, cap table rules) and hash-anchor it to the chain.
- Pre-agree **corporate actions playbooks** (splits, redemptions, events) with your registrar & CSD/ICSD where relevant.

### Custody

- Segregate **client assets** (on-chain addresses + books/records).
- Implement **dual-control key ops** (MPC/HSM), **break-glass** procedures, and **compensating-transaction** runbooks for error remediation.
- Evidence **BaFin-grade controls**: SOC 2/ISO 27001, incident reporting, disaster recovery, and reconciliations to the register.

### Trading

- Map whether secondary trading is on a **regulated venue/MTF/OTF** or OTC; align **market-abuse surveillance** and **insider lists**.
- Listing policy must check **instrument classification** (eWpG vs. MiFID financial instrument) and prospectus triggers.
- Maintain **delisting & suspension** criteria (e.g., register incident, issuer disclosure failure).

### Identity & Compliance

- Run **KYC/AML** on holders where required (esp. for primary distribution & restricted tranches).
- Enforce **transfer restrictions** at the smart-contract layer (whitelists, jurisdiction filters) with auditable overrides.
- Keep **beneficial ownership** and **sanctions screening** evidence tied to on-chain addresses.

### Data & Oracles

- Log **register events** (issuance, transfer, cancellation) with immutable audit trails and time-stamped proofs.
- For pricing, document oracle **governance** (sources, fallbacks, dispute policy) if feeding NAV or disclosures.
- Monitor **chain liveness**; define **RTO/RPO** and business-continuity switchover (e.g., read-only mirror, delayed settlement mode).

## Key Risks to Watch

- **Regime overlap**: eWpG vs. **MiCA** / **MiFID** classification; prospectus obligations.
- **Registrar liability** for outages or erroneous entries.
- **Insolvency segregation**: ensure custody/legal title is bankruptcy-remote.

## Enterprise Opportunities

- **Native on-chain securities** under a major EU jurisdiction.
- Streamlined **corporate actions** and transparent cap-tables with regulator-recognised registers.

## Glossary

- **eWpG** — German Electronic Securities Act
- **Crypto-securities register** — DLT register for eWpG instruments
- **Registrar** — Licensed operator accountable for the register’s correctness

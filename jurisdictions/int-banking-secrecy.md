---
title: "Jurisdictional Focus: Banking Secrecy (Operating Constraints)"
status: draft
region: Multi-jurisdiction (CH/DE/LU/EU context)
scope:
  entities: [banks, custodians, brokers, CASPs, asset managers]
  activities: [onboarding, data handling, investigations, cross-border ops]
key-regulations:
  - National banking-secrecy laws (e.g., CH Banking Act Art. 47; DE contractual secrecy)
  - AML/CTF & sanctions regimes (EU AML, FATF, BSA/FinCEN)
  - Cross-border transfer rules
---

## At a Glance

**Banking secrecy** protects client financial data from unauthorised disclosure, but it is **not absolute**: it yields to **AML/CTF, tax cooperation (CRS/FATCA), court orders, and supervisory requests**. For crypto enterprises, secrecy rules primarily impact **what you store, where you store it, who can access it, and how you disclose it** across borders.

## Core Compliance Expectations

- **Lawful basis & purpose limitation** for all client data; retain only what is necessary.
- **Access controls & confidentiality** obligations for staff and vendors.
- **Regulator & court cooperation** procedures that comply with secrecy laws while meeting legal requests.
- **Cross-border data transfer** mechanisms (e.g., SCCs, adequacy, intra-group agreements).

## Actionable Best Practices

### Custody

- **Data minimisation by design**: separate **identity data** from **on-chain addresses**; store link tables in a **restricted enclave**.
- **Role-based access** (RBAC) + **need-to-know**; rotate access keys; maintain **keystroke-level audit logs**.
- **Encryption** end-to-end (HSM/MPC for keys; TDE for databases; secrets rotation).
- **Client statements** and attestations should avoid unnecessary PII; expose **proofs** (balances, events) without raw data when possible.

### Identity & Compliance

- Document a **secrecy-aware KYC/CDD/EDD** flow: explain lawful basis, retention, and sharing with authorities/partners.
- Build a **Regulatory Request Gateway**: standard operating procedure for handling subpoenas/supervisory requests with legal review and **minimum necessary disclosure**.
- Keep **jurisdictional routing rules** (which data can leave the country; which NCA/authority is competent).

### Trading

- When sharing order-flow or surveillance data with venues/analytics providers, **pseudonymise** and **tokenise** customer IDs; use **clean-rooms** where feasible.
- Contract **no onward disclosure** and **audit rights** with data vendors; test logs for leakage (trade re-identification).

### Data & Oracles

- Maintain a **data map** (systems, locations, vendors) and a **Register of Information** (align with DORA for EU ops).
- Apply **differential privacy / aggregation** for dashboards; avoid raw client data in analytics.
- For cross-border replication, use **geo-fencing** and **encryption with local key custody** where secrecy laws require local control.

### Payments

- For **stablecoin integrations** and banking rails, implement **Travel Rule** tooling that transmits only required fields, with **policy-based redaction** and **fail-closed** when counterparty data is missing.
- Keep **client notifications** templates for lawful disclosures (tax, AML) to preserve trust.

## Key Risks to Watch

- **Conflict of laws**: secrecy vs. AML/sanctions disclosure; pre-clear your escalation paths.
- **Vendor leakage**: analytics/monitoring tools exporting PII to foreign jurisdictions.
- **Shadow copies** in backups/logs violating data-minimisation or residency commitments.

## Enterprise Opportunities

- **Privacy-by-design** as a competitive edge (institutional RFPs score on this).
- **Selective-disclosure** (ZK proofs, signed attestations) to answer audits without over-sharing raw data.

## Glossary

- **Banking secrecy** — Statutory/contractual duty to keep client financial data confidential
- **CRS/FATCA** — Cross-border tax reporting regimes that override secrecy in defined cases
- **SCCs** — Standard Contractual Clauses used for compliant cross-border data transfers

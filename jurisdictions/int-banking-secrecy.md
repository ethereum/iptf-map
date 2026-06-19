---
title: "Jurisdiction: Banking Secrecy (multi-jurisdiction)"
status: ready
region: Global
scope:
  entities: [banks, custodians, brokers, CASPs, asset managers]
  activities: [onboarding, data handling, investigations, cross-border ops]
key-regulations:
  - National banking-secrecy laws (e.g., CH Banking Act Art. 47)
  - AML/CTF & sanctions regimes (EU AML, FATF, BSA/FinCEN)
  - Cross-border tax cooperation (CRS / FATCA)
last_reviewed: 2026-06-19
---

> High-level orientation for developers — not legal advice.

## At a Glance

Banking-secrecy laws (strongest in places like Switzerland) protect client financial data from disclosure — but they are **not absolute**: they yield to AML/CTF, sanctions, tax cooperation (CRS/FATCA), court orders, and supervisory requests. For crypto builders the practical question is **what client data you store, where, who can access it, and how cross-border disclosure works** — a data-residency and minimisation concern as much as a confidentiality one. Posture: **confidential by default, disclosable by law**.

## What to Watch

- Conflict of laws: secrecy vs AML/sanctions disclosure obligations.
- Cross-border data transfer and residency constraints.
- Vendor/analytics tooling leaking client data across jurisdictions.

## See also

- [Jurisdiction: EU Data Protection & PETs](./eu-data-protection.md)
- [Selective Disclosure pattern](../patterns/pattern-regulatory-disclosure-keys-proofs.md)

---
title: Private Payments
status: stub
primary_domain: Payments
secondary_domain: Identity & Compliance
---

## 1) Use Case

Cross-border and domestic payment transfers where transaction details must remain confidential between parties. Transaction patterns reveal business relationships, purchasing behavior, and financial health - often more than any other data source. Privacy applies to both institutional and retail payment contexts.

See [private-stablecoins.md](private-stablecoins.md) for stablecoin-specific privacy patterns. Private payments covers broader payment rails including non-stablecoin transfers, CBDCs, and traditional payment integration.

## 2) Additional Business Context

**Confidential context:** Available in private IPTF repo

## 3) Actors

Banks · Payment Service Providers (PSPs) · Corporates · Consumers · Regulators · Central Banks · Grant-disbursing institutions · Field implementers · Auditors · Beneficiaries

## 4) Problems

### Problem 1: Transaction Privacy for Businesses

Business-to-business payment patterns reveal supplier relationships, pricing, and strategic priorities. Competitors can reverse-engineer business models from payment flows.

**Requirements:**

- **Must hide:** Amounts, counterparty identities, payment purpose/memo, timing patterns
- **Public OK:** Payment system availability, general network statistics
- **Regulator access:** AML/CFT monitoring, tax reporting, sanctions screening

**Constraints:**

- Real-time or near-real-time settlement expectations
- Cross-border regulatory fragmentation
- Integration with existing payment infrastructure (SWIFT, ACH, SEPA)

### Problem 2: Consumer Payment Privacy

Retail payments on public ledgers expose personal spending patterns, location data, and lifestyle information.

**Requirements:**

- **Must hide:** Purchase details, merchant relationships, spending patterns
- **Public OK:** Payment network existence
- **Regulator access:** Consumer protection enforcement, fraud monitoring

**Constraints:**

- User experience requirements (speed, simplicity)
- Merchant acceptance and integration
- Chargeback and dispute resolution mechanisms

### Problem 3: Conditional & Programmable Payment Privacy

Institutions disbursing grants or payments on the ground (government-to-person transfers, milestone-based grants, field disbursements) need release conditions tied to attestations (eligibility verified, delivery confirmed, job done) while keeping those conditions and amounts private. The payer must prove correct disbursement to auditors without exposing individual beneficiary data.

**Requirements:**

- **Must hide:** Individual beneficiary identities, disbursement amounts, specific release conditions
- **Public OK:** Programme existence, aggregate disbursement totals, attestation schema
- **Auditor access:** Proof that release conditions were met before each payment; aggregate compliance reports

**Constraints:**

- Field conditions: low-connectivity environments, mobile-first beneficiaries
- Attestation verification must work at scale (thousands of conditional payments per programme)
- Cross-jurisdiction compliance when disbursing across borders

## 5) Recommended Approaches

See [private-stablecoins.md](private-stablecoins.md) for stablecoin-based privacy patterns. Additional considerations:

- CBDC privacy models (government-issued with privacy guarantees)
- Integration with existing payment rails
- Privacy-preserving compliance (sanctions, AML)
- Programmable payments tied to attestations: conditional release on attested eligibility or milestones, with selective disclosure for auditors

## 6) Open Questions

- Where is the line between payment privacy and AML/CFT obligations?
- How do CBDCs with privacy compare to private stablecoins?
- What's the migration path from traditional payment systems?
- How do privacy requirements differ between commercial B2B payments and institutional grant disbursement with on-the-ground verification?

## 7) Notes And Links

- Related: [private-stablecoins.md](private-stablecoins.md) (stablecoin-specific privacy)
- Related: [private-fx.md](private-fx.md) (cross-currency payments)
- Related: [private-treasuries.md](private-treasuries.md) (corporate payment context)
- Market context: Governments building digital currency infrastructure; cross-border payment networks exploring blockchain alternatives to SWIFT
- Note: Transaction patterns are highly revealing of business and personal activity
- See also: [EPIC map](https://epic-webapp.vercel.app/) (GovTech & EPIC team) — G2P payments, aid disbursement

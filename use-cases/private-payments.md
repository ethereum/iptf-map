---
title: Private Payments
primary_domain: Payments
secondary_domain: Identity & Compliance
---

## 1) Use Case

Cross-border and domestic payment transfers where transaction details must remain confidential between parties. Transaction patterns reveal business relationships, purchasing behavior, and financial health - often more than any other data source. Privacy applies to both institutional and retail payment contexts.

See [private-stablecoins.md](private-stablecoins.md) for stablecoin-specific privacy patterns. Private payments covers broader payment rails including non-stablecoin transfers, CBDCs, and traditional payment integration.

## 2) Additional Business Context

**Confidential context:** Available in private IPTF repo

## 3) Actors

Banks · Payment Service Providers (PSPs) · Corporates · Consumers · Regulators · Central Banks

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

## 5) Recommended Approaches

See [Approach: Private Payments](../approaches/approach-private-payments.md) for detailed solution architecture covering L1 shielded pools, Plasma/Intmax2 stateless rollups, privacy L2s, TEE, and MPC approaches with quantitative comparison from PoC validation.

See also [private-stablecoins.md](private-stablecoins.md) for stablecoin-specific privacy patterns. Additional considerations:

- CBDC privacy models (government-issued with privacy guarantees)
- Integration with existing payment rails
- Privacy-preserving compliance (sanctions, AML)

## 6) Open Questions

- How can payment privacy coexist with AML/CFT obligations? Attestation-gated entry is one approach; what are the trade-offs across jurisdictions?
- How do CBDCs with privacy compare to private stablecoins?
- What's the migration path from traditional payment systems?
- Network timing correlation: both L1 and L2 privacy approaches leak metadata; see [Network-Level Anonymity](../patterns/pattern-network-anonymity.md)

## 7) Notes And Links

- Related: [private-stablecoins.md](private-stablecoins.md) (stablecoin-specific privacy)
- Related: [private-fx.md](private-fx.md) (cross-currency payments)
- Related: [private-treasuries.md](private-treasuries.md) (corporate payment context)
- Reference: [Private Payment PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-payment)
- Market context: Governments building digital currency infrastructure; cross-border payment networks exploring blockchain alternatives to SWIFT
- Note: Transaction patterns are highly revealing of business and personal activity

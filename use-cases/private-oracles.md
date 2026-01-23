---
title: Private Oracles
status: stub
primary_domain: Data Oracles
secondary_domain: Trading
---

## 1) Use Case

Price feeds and data sources that protect query privacy - hiding which institutions are requesting specific information. Query patterns reveal trading intent, enabling front-running and information arbitrage. Going forward, the assumption is that oracles should be default private; the entire stack must be end-to-end with no information leakage.

## 2) Additional Business Context

**See confidential context:** [context/use-cases/context-private-oracles.md](../../context/use-cases/context-private-oracles.md)

## 3) Actors

Data Providers · Banks · Trading Firms · Oracle Operators · Regulators

## 4) Problems

### Problem 1: Query Privacy and Trading Intent Leakage

Institutions querying price feeds reveal their trading interest. Knowing who is looking at what prices enables front-running, information arbitrage, and competitive intelligence gathering.

**Requirements:**

- **Must hide:** Query source (which institution is asking), query targets (which prices/data), query timing and frequency patterns
- **Public OK:** Aggregated price data, oracle availability, data freshness
- **Regulator access:** Audit trail of queries for market surveillance; selective disclosure mechanisms

**Constraints:**

- Data integrity and availability must not be compromised
- Latency requirements for trading applications
- End-to-end privacy: entire stack must prevent information leakage

### Problem 2: Data Provider Revenue Models

Some institutions (particularly banks) are data providers/originators. Privacy requirements must accommodate both data consumption and data provision roles.

**Requirements:**

- **Must hide:** Who is consuming specific data feeds
- **Public OK:** Data availability, quality metrics
- **Regulator access:** Data provenance, accuracy verification

**Constraints:**

- Data licensing and revenue attribution
- Multiple data provider aggregation
- Conflict of interest management

## 5) Recommended Approaches

Approach TBD. Going forward, assumption is oracles should be default private.

Consider:
- Private information retrieval (PIR) techniques
- Encrypted query mechanisms
- Aggregated data delivery (hide individual queries in batches)

## 6) Open Questions

- Which markets have the highest priority for private oracles (bonds, derivatives, FX, funds)?
- How does private oracle infrastructure integrate with existing data providers?
- What's the performance overhead for query privacy?

## 7) Notes And Links

- Cross-cutting concern: affects all use cases requiring external data
- Related: [private-read.md](private-read.md) (query privacy for blockchain state)
- Related: [private-derivatives.md](private-derivatives.md) (oracle-dependent pricing)
- Note: "Going forward, assumption is oracles are all default private. Entire stack must be end-to-end with no information leakage."

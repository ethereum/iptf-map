---
title: Private Money Market Funds
status: stub
primary_domain: Funds & Assets
secondary_domain: Payments
---

## 1) Use Case

Tokenized money market funds providing yield-bearing treasury management for institutions. Unlike stablecoins (which typically don't earn yield), money market funds are productive assets generating returns. Institutions prefer MMFs over non-yield stablecoins for treasury management but require privacy for position sizes and yield strategies.

## 2) Additional Business Context

**See confidential context:** [context/use-cases/context-private-money-market-funds.md](../../context/use-cases/context-private-money-market-funds.md)

## 3) Actors

Asset Managers · Institutional Investors · Banks · Custodians · Regulators · NAV Calculation Agents

## 4) Problems

### Problem 1: Position and Strategy Privacy

Large MMF positions reveal treasury management strategies and cash reserves. Competitors can infer financial health and business plans from position sizes.

**Requirements:**

- **Must hide:** Position sizes, subscription/redemption timing, yield optimization strategies
- **Public OK:** Fund NAV, total AUM, portfolio composition (at aggregate level)
- **Regulator access:** Investor concentration monitoring, liquidity stress testing data, SEC reporting

**Constraints:**

- Daily NAV calculations
- SEC Rule 2a-7 compliance (for US funds)
- Liquidity requirements for redemptions
- significant cost reduction expectations driving adoption

### Problem 2: Redemption Pattern Privacy

Redemption patterns signal liquidity needs or market views. Large redemptions can trigger runs if publicly visible.

**Requirements:**

- **Must hide:** Individual redemption requests, timing, amounts
- **Public OK:** Aggregate fund flows (delayed)
- **Regulator access:** Liquidity monitoring, stress scenario analysis

**Constraints:**

- Same-day or T+1 redemption requirements
- Gate and fee provisions
- Systemic risk monitoring obligations

## 5) Recommended Approaches

Approach TBD. Consider:
- Privacy-preserving subscription/redemption mechanisms
- Confidential NAV sharing with authorized parties
- Integration with custody and settlement infrastructure

## 6) Open Questions

- How does yield attribution work with position privacy?
- What's the relationship to stablecoin privacy patterns?
- How to handle fund gates/fees with position privacy?

## 7) Notes And Links

- Related: [private-stablecoins.md](private-stablecoins.md) (non-yield alternative; settlement cash)
- Related: [private-treasuries.md](private-treasuries.md) (corporate treasury use of MMFs)
- Differentiation: Unlike stablecoins, money market funds earn yield. Institutions prefer MMFs over non-yield stablecoins for treasury management.
- Market context: Largest RWA category outside stablecoins; significant cost reduction driving adoption

---
title: "Vendor: Flashbots"
status: draft
maturity: production
---

# Flashbots – MEV Infrastructure & SUAVE

**Category:** MEV Infrastructure / Privacy Infrastructure  
**Maturity:** Production (Flashbots Auction), Development (SUAVE)  
**Focus:** MEV mitigation, private mempools, and decentralized block building

## Overview

Flashbots develops **MEV infrastructure** including private mempools, block building, and **SUAVE** (Single Unifying Auction for Value Expression) - a decentralized platform for private intent expression and execution.

## Key Use Cases / Patterns

- [Pre-trade Privacy](../patterns/pattern-pretrade-privacy-shutter-suave.md) - Private intent expression via SUAVE
- [Private Broadcasting](../approaches/approach-private-broadcasting.md) - MEV protection through private mempools

## Technical Approach

**Flashbots Auction:**

- **Private Mempools:** Transactions submitted directly to builders, bypassing public mempool
- **MEV-Share:** Users capture portion of MEV from their transactions
- **Block Building:** Competitive block construction with MEV extraction

**SUAVE (Under Development):**

- **Universal Intent Pool:** Cross-domain intent expression and matching
- **Programmable Privacy:** Selective revelation of intent information
- **Decentralized Execution:** Multiple execution environments for intent fulfillment

## What It Provides

- Private transaction submission bypassing public mempool
- MEV protection through direct builder relationships
- Revenue sharing mechanisms (MEV-Share)
- Cross-chain intent expression (SUAVE)
- Decentralized block building infrastructure

## What It Doesn't Cover

- Complete MEV elimination (redistributes rather than eliminates)
- Privacy after execution (transactions still visible on-chain)
- Regulatory compliance frameworks
- Long-term privacy guarantees (relies on builder trust)

## Integration Notes

- **Networks:** Ethereum mainnet (Flashbots), Multi-chain (SUAVE)
- **Developer Tools:** MEV-Share SDK, Flashbots Auction APIs
- **Builder Network:** Requires integration with participating builders
- **Intent Standards:** SUAVE developing cross-chain intent standards

## Strengths

- Established MEV mitigation with significant adoption
- Strong relationship with Ethereum ecosystem
- Active development of next-generation infrastructure (SUAVE)
- Revenue sharing mechanisms align user incentives

## Limitations

- Centralization concerns with builder relationships
- SUAVE still in development phase
- Limited privacy guarantees (trust-based model)
- Regulatory uncertainty around MEV redistribution

## Links

- [Flashbots](https://flashbots.net/)
- [MEV-Share](https://docs.flashbots.net/flashbots-mev-share/overview)
- [SUAVE](https://writings.flashbots.net/the-future-of-mev-is-suave)
- [Documentation](https://docs.flashbots.net/)

---
title: "Vendor: Orion Finance"
status: ready
maturity: testnet
---

# Orion Finance – Private, Intent-Based Portfolio Vaults (Encrypted Onchain Portfolio Management)

## What it is

Orion Finance enables **private, onchain portfolio management** by integrating **confidential smart contracts** powered by advanced cryptography (FHEVM).  
Managers can run **encrypted strategies**, protecting their alpha while keeping results auditable and verifiable onchain.  
The architecture preserves DeFi’s **composability and transparency** for users while adding **institutional-grade confidentiality** for asset managers.

## Fits with patterns

- [Private Intent-Based Vaults](../patterns/pattern-private-vaults.md) - Core use case: encrypted strategy execution while keeping assets auditable
- [Private L2s](../patterns/pattern-privacy-l2s.md) - FHEVM infrastructure for privacy-native portfolio execution
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md) - Auditable performance metrics while maintaining strategy confidentiality

## Not a substitute for

- Public yield vaults or transparent portfolio managers
- Centralized asset management infrastructure

## Architecture

- **Vault Layer:** Encrypted ERC-4626 / ERC-7540 vaults supporting multiple strategies.
- **Execution Layer:** Confidential smart contracts using **FHEVM (ERC-7984)** to keep strategy parameters private.
- **Aggregation:** Gas-optimized batching and netting of transactions.
- **Transparency:** Onchain state remains auditable and composable across DeFi protocols.

## Privacy domains

- Encrypted execution (FHE) for strategy confidentiality.
- Transparent vault assets and verifiable performance metrics.

## Enterprise demand and use cases

- Institutional portfolio managers and hedge funds seeking **onchain strategy execution without alpha leakage**.
- DeFi asset managers requiring **auditable but private** portfolio automation.

## Technical details

- Built with ERC-4626, ERC-7540, ERC-7887, and ERC-7984 (FHEVM).
- Integrates with Zama’s FHE technology for confidential computation.
- Modular vault framework enabling flexible and auditable portfolio creation.

## Strengths

- Protects alpha through encryption while maintaining composability.
- Reduces gas costs via batching and netting mechanisms.
- Auditable, interoperable design for regulated DeFi strategies.

## Risks and open questions

- Scalability and FHE performance overhead.
- Standardization of encrypted intent and strategy formats.
- Long-term interoperability with other privacy L2s.

## Links

- [Website](https://www.orionfinance.ai/)
- [Documentation](https://docs.orionfinance.ai/)
- [GitHub Repository](https://github.com/orionfinance)

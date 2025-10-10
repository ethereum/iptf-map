---
title: "Vendor: Shutter"
status: draft
maturity: production
---

# Shutter Network – Encrypted Mempool & MEV Protection

**Category:** Privacy Infrastructure  
**Maturity:** Pilot/Production (Gnosis Chain)  
**Focus:** Pre-trade privacy through encrypted mempools and threshold decryption

## Overview

Shutter Network provides **encrypted mempool** infrastructure that prevents MEV extraction and front-running by encrypting transactions until they are included in blocks, using **threshold cryptography** for decryption.

## Key Use Cases / Patterns

- [Pre-trade Privacy](../patterns/pattern-pretrade-privacy-shutter-suave.md) - Encrypted mempool with threshold decryption
- [Private Broadcasting](../approaches/approach-private-broadcasting.md) - Intent signaling protection

## Technical Approach

Shutter uses **threshold encryption** where:

- **Transaction Encryption:** Users encrypt transactions with a shared public key
- **Distributed Decryption:** Network of validators collectively decrypt transactions after block inclusion
- **MEV Prevention:** Searchers cannot see transaction content during the vulnerable mempool phase
- **Ordering Protection:** Prevents front-running while maintaining transaction validity

## What It Provides

- Encrypted mempool preventing MEV extraction during broadcasting
- Threshold decryption ensuring no single point of failure
- Integration with existing Ethereum infrastructure
- Censorship resistance through distributed key management

## What It Doesn't Cover

- Post-execution privacy (transactions visible after inclusion)
- Cross-chain MEV protection
- Complex intent expression (focuses on transaction-level protection)

## Integration Notes

- **Networks:** Live on Gnosis Chain, Ethereum integration planned
- **Compatibility:** Works with standard Ethereum transactions
- **Validator Requirements:** Requires network of threshold key holders
- **Developer Experience:** Minimal changes to existing dApp integration

## Strengths

- Proven solution with mainnet deployment
- Strong cryptographic foundations (threshold encryption)
- Minimal impact on existing Ethereum workflows
- Effective MEV prevention during critical mempool phase

## Limitations

- Limited to supported networks (Gnosis Chain currently)
- Adds latency due to threshold decryption process
- Requires coordination among threshold key holders
- No protection against MEV after transaction execution

## Links

- [Shutter Network](https://shutter.network/)
- [Documentation](https://docs.shutter.network/)
- [GitHub](https://github.com/shutter-network)

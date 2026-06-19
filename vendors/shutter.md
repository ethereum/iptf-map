---
title: "Vendor: Shutter"
status: ready
maturity: production
---

# Shutter Network – Encrypted Mempool & MEV Protection

## What it is

Shutter Network provides encrypted-mempool infrastructure that prevents MEV extraction and front-running by encrypting transactions until they are included in blocks, using threshold cryptography for decryption. It is live on Gnosis Chain, with Ethereum integration planned.

## Fits with patterns

- [Pre-trade Privacy](../patterns/pattern-pretrade-privacy-encryption.md) — encrypted mempool with threshold decryption
- [Private Broadcasting](../approaches/approach-private-broadcasting.md) — intent signaling protection

## Not a substitute for

- Post-execution privacy (transactions are visible after inclusion)
- Cross-chain MEV protection
- Complex intent expression (focuses on transaction-level protection)

## Architecture

Shutter uses threshold encryption: users encrypt transactions with a shared public key; a network of validators collectively decrypts them after block inclusion; searchers cannot see transaction content during the vulnerable mempool phase; ordering protection prevents front-running while maintaining transaction validity.

## Enterprise demand and use cases

- Encrypted mempool preventing MEV extraction during broadcasting
- Threshold decryption with no single point of failure
- Censorship resistance through distributed key management

## Technical details

- **Networks:** live on Gnosis Chain; Ethereum integration planned
- **Compatibility:** works with standard Ethereum transactions
- **Validator requirements:** requires a network of threshold key holders
- **Developer experience:** minimal changes to existing dApp integration

## Strengths

- Proven solution with mainnet deployment
- Strong cryptographic foundations (threshold encryption)
- Minimal impact on existing Ethereum workflows
- Effective MEV prevention during the critical mempool phase

## Risks and open questions

- Limited to supported networks (Gnosis Chain currently)
- Adds latency due to the threshold decryption process
- Requires coordination among threshold key holders
- No protection against MEV after transaction execution

## Links

- [Shutter Network](https://shutter.network/)
- [Documentation](https://docs.shutter.network/)
- [GitHub](https://github.com/shutter-network)

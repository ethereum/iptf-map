---
title: "Vendor: Zama"
status: draft
maturity: testnet
---

# Zama – FHE SDK & Confidential Smart Contracts (Fully Homomorphic Encryption for EVM)

## What it is

Zama develops **open-source FHE (Fully Homomorphic Encryption)** tools that enable confidential smart contracts and encrypted data processing directly on EVM-compatible networks.

## Fits with patterns

- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md) - FHE enables encrypted balances/amounts for confidential transfers
- [Private Intent-Based Vaults](../patterns/pattern-private-vaults.md) - FHE-enabled chains allow private strategy execution while keeping assets auditable
- [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md) - Native FHE implementation for confidential token transfers
- [Private L2s](../patterns/pattern-privacy-l2s.md) - Zama's fhEVM provides FHE-based rollup capabilities
- [ZK Shielded Balances](../patterns/pattern-zk-shielded-balances.md) - FHE can complement ZK approaches for confidential balance management

## Not a substitute for

- ZK-based L2 privacy (e.g., Aztec, Scroll)
- MPC or TEEs for off-chain privacy computation

## Architecture

Smart contracts are compiled with Zama’s FHE libraries (e.g., `concrete`, `fhEVM`) allowing arithmetic on encrypted values. Execution happens deterministically, with ciphertexts persisted on-chain.

## Privacy domains

- FHE encryption at the contract and variable level.
- Supports hybrid models (FHE + ZK for verification).

## Enterprise demand and use cases

- Financial institutions seeking **on-chain confidentiality** with deterministic settlement.
- Private vaults, confidential lending, or yield strategies.

## Technical details

- EVM-compatible FHE runtime (`fhEVM`)
- SDKs for Solidity and TypeScript
- Ongoing collaborations with Fhenix and Aleph Zero

## Strengths

- Native EVM integration
- Strong cryptographic research pedigree
- Open-source and actively maintained

## Risks and open questions

- High compute cost and latency
- Limited developer tooling maturity
- Interoperability between FHE networks still emerging

## Links

- [https://www.zama.ai](https://www.zama.ai)
- [https://github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- [Confidential ERC-20](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption)

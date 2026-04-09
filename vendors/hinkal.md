---
title: "Vendor: Hinkal"
status: draft
maturity: production
---

# Hinkal - ZK-enabled smart contract for private stablecoin settlements on Ethereum Mainnet, Solana and Tron

## What it is

Hinkal is a smart contract on public chains that lets users hold private balances controlled through their existing wallet keys. This enables users to send, receive and operate in stablecoins confidentially, 
without changing chains or custody. Through zero-knowledge proofs, every transaction is proven valid and verifiable on public chains, while participants and amounts stay private. Via viewing keys, users can selectively 
disclose transaction history to preserve auditability. And for compliance, Chainalysis KYT screens wallet addresses before execution to prevent high-risk funds from entering the smart contract.

## Fits with patterns (names only)

-	Pattern: Shielded Account-Based Payments (ZK UTXO Hybrid)
-	Pattern: Private Multi-Asset Transfers (ZK-SNARKs)
-	Pattern: Cross-Chain Private Settlement Layer
-	Pattern: Compliance-Aware Privacy (Selective Disclosure ZK)
-	Pattern: Relayer-Based Private Execution (Gas Abstraction)

## Not a substitute for

- Not a mixer or simple obfuscation tool
- Not a private L1/L2 chain
- Not a privacy rollup

## Architecture

- **Execution model**: Smart-contract-based confidential settlement on public chains using UTXO-style commitments (`commitments`, `nullifiers`).
- **Proof system**: zkSNARKs (Groth16).
- **Settlement**: Instead of direct wallet-to-wallet transfers, users execute transactions from private accounts controlled by their existing wallet keys. 
  On-chain, only the Hinkal smart contract and the relayer address are visible, while the sender, recipient, and amount remain private.
- **Integration**: SDK or API integration for wallets, payment processors, treasury systems, payout flows and more.
- **Data availability**: Commitments and nullifiers are stored in canonical on-chain contract state.

## Privacy domains

- **Confidential balances**: shield balances inside the smart contract without giving up custody.
- **Counterparty privacy**: keep both sender and recipient confidential in supported settlement flows.
- **Amount privacy**: keep transaction amounts private on-chain in supported confidential settlement and payout flows.
- **Selective disclosure / auditability**: transaction history can be selectively revealed through viewing keys for audit, regulatory, or counterparty purposes.

## Enterprise demand and use cases

- **Payment service providers**: confidential merchant settlement, payouts, and treasury flows. 
- **Payroll, remittances and invoicing**: private salary, contractor and vendor payments.
- **Wallets and custody platforms**: native privacy embedded directly into wallet dashboards and APIs. 
- **Exchanges, on-ramps, and OTC desks**: private withdrawals and settlement flows for customers receiving funds on public chains. 
- **Enterprise treasury and payment operations**: confidential treasury management and payout infrastructure for companies using stablecoins.

## Technical details

- zk-SNARK proving via Groth16
- Smart contract architecture deployed on Ethereum Mainnet, Solana and Tron
- UTXO model: each note represents a claim on deposited tokens; nullifiers prevent double spends.

## Strengths

- Multichain. Available on Ethereum Mainnet, Solana and Tron
- Works with existing wallets, custody setups, stablecoins, and payment infrastructure.
- Preserves recipient privacy without CEX routing
- Built-in compliance controls - viewing keys and KYT

## Risks and open questions

- Smart-contract and proving overhead
- Practical privacy depends on adoption, transaction activity and TVL

## Links

- [hinkal gitbook](https://hinkal-team.gitbook.io/hinkal)
- [hinkal website](https://hinkal.io/)
- [hinkal use cases](https://hinkal.pro/blog/)


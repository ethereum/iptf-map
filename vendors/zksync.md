---
title: "Vendor: zkSync Prividium"
status: draft
---

# zkSync - Prividium (Privacy L2 for Ethereum)

## What it is

An Ethereum-secured blockchain platform purpose-built for institutions that demand privacy, compliance, and full control of their data. Prividium is part of zkSync's suite of enterprise solutions, designed for real-world asset tokenization, private capital markets, and institutional-grade financial infrastructure with selective disclosure capabilities.

## Fits with patterns (names only)

- Privacy L2s
- Private Stablecoin Shielded Payments
- Shielding
- ZK Shielded Balances

## Not a substitute for

- General-purpose public DeFi infrastructure (focused on institutional use cases)
- Permissionless privacy solutions (designed for compliant institutional access)
- General-purpose Privacy rollups

## Architecture

- Permissioned RPCs
- Each Prividium manages their own private state and permission controls
- Prividiums uses the ZkSync Gateway for setllement, who Zk commit blocks on the Ethereum L1

## Privacy domains (if applicable)

- User-level privacy with selective disclosure for policy compliance
- Private order flow execution with public price integrity proofs
- Confidential real-world asset tokenization and settlement
- Cross-border payment privacy with cryptographic settlement

## Enterprise demand and use cases

Target segments include financial institutions tokenizing treasuries and fund shares, capital markets requiring private order flow, and enterprises needing cross-border settlement. Key use cases involve real-world asset tokenization, and institutional-grade payment infrastructure with compliance integration.

## Technical details

- Powered by Airbender RISC-V prover delivering subsecond block proofs on commodity GPUs with ~$0.0001 per transfer costs
- EVM-native development using Solidity, Hardhat, and Foundry without custom languages
- Includes passkeys, smart accounts, and session keys for institutional onboarding
- Integration with zkSync Connect for interoperability across public and private systems.

## Strengths

- Comprehensive enterprise features including compliance, KYC/AML, and selective disclosure
- Efficient ZK Proving
- Modularity and interop accross Prividiums
- L1 as final settlement layer

## Risks and open questions

- Institutional focus may limit broader DeFi ecosystem adoption
- Compliance requirements could create barriers for permissionless innovation
- No technical specs published yet

## Links

- [Prividium Documentation](https://docs.zksync.io/zk-stack/prividium)

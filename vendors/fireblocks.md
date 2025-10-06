---
title: "Vendor: Fireblocks"
status: draft
---

# Fireblocks – Institutional Digital Asset Custody & Tokenization

## What it is

Fireblocks is a custody and infrastructure platform that provides secure wallet management and transaction workflows for institutions. In addition to custody and settlement rails, Fireblocks supports tokenization workflows, including issuing and managing tokenized bonds and other real-world assets for banks and asset managers.

## Fits with patterns

- [MPC Custody](../patterns/pattern-mpc-custody.md)
- [DvP ERC7573](../patterns/pattern-dvp-erc7573.md.md)
- [ISO-20022](../patterns/pattern-private-iso20022.md.md)
- [TEE ZK Settlement](../patterns/pattern-tee-zk-settlement.md)

## Not a substitute for

- General-purpose privacy layers (e.g. shielded pools, ZK-based protocols)
- Open settlement infrastructure on public blockchains

## Architecture

Fireblocks’ core system is based on an MPC (Multi-Party Computation) wallet engine. Keys are never reconstructed in a single place; signing requires multiple parties within a distributed network of secure environments. Institutions connect through APIs to initiate transfers, approvals, and tokenization workflows. Tokenization is performed on supported networks (Ethereum, Polygon, and selected permissioned ledgers) using Fireblocks’ issuance modules.

## Privacy domains (if applicable)

- Custodial privacy: private key material is never exposed, fragmented across MPC nodes
- Transaction privacy: limited; transaction metadata visible on underlying blockchain, but workflows can integrate with permissioned ledgers for confidentiality

## Enterprise demand and use cases

Target segments include banks, custodians, and asset managers. Common implementations are tokenized bond issuance, secure custody for tokenized securities, and settlement rails for OTC trading desks. Buyers are typically compliance-heavy institutions requiring regulated custody.

## Technical details

- MPC-based wallet infrastructure (Threshold ECDSA/EdDSA)
- API-driven integration for institutions
- Supports public EVM chains and permissioned ledgers
- Tokenization modules for fixed-income instruments and other RWAs

## Strengths

- Regulated custody with proven MPC engine
- API integration fits institutional IT workflows
- Tokenization capabilities directly aligned with fixed-income desks

## Risks and open questions

- Custodial model creates centralization and reliance on Fireblocks as operator
- Privacy depends on choice of underlying chain (public vs permissioned)
- Limited interoperability with emerging ZK-based privacy standards

## Links

- [Fireblocks Website](https://www.fireblocks.com)
- [MPC Wallet Engine Whitepaper](https://www.fireblocks.com/platform/secure-mpc-wallet)
- [Tokenization Overview](https://www.fireblocks.com/solutions/tokenization)

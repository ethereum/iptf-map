---
title: "Vendor: EY Nightfall"
status: production
---

# EY - Nightfall v4 (Enterprise Privacy Rollup)

## What it is

A production-ready Zero-Knowledge rollup for private token transfers with enterprise compliance features. Nightfall v4 implements a ZK rollup that provides immediate finality and supports ERC20, ERC721, ERC1155, and ERC3525 tokens with X509 certificate-based access control.

## Fits with patterns

- Private Stablecoin Shielded Payments
- Privacy L2s
- Regulatory Disclosure Keys Proofs
- Private ISO20022

## Not a substitute for

- General-purpose privacy L2s (focused on enterprise transfers)
- Public DeFi composability (limited composability by design)
- Low-resource deployment environments (requires significant compute)

## Architecture

Client-Proposer model with separate containerized roles. Clients generate UltraPlonk proofs for private transactions and submit to Proposers who create Layer 2 blocks with rollup proofs. X509 certificate validation gates all network access. Uses commitment-nullifier privacy model (UTXO-style) with MongoDB storage for metadata and Merkle tree state. Supports webhook integration for asynchronous processing.

## Privacy domains (if applicable)

- Certificate-gated private transfers with immediate ZK rollup finality
- Selective disclosure for regulatory compliance and audit trails
- Enterprise treasury operations with confidential payment flows

## Enterprise demand and use cases

Target segments include multinational corporations, financial institutions

## Technical details

- UltraPlonk proof system with no per-circuit trusted setup
- supporting ERC20/721/1155/3525 standards
- RESTful APIs for deposit, transfer, withdraw operations with X-Request-ID tracking
- Integration with LocalWallet, AzureWallet, and HSM for enterprise key management
- Sophisticated chain reorganization handling and immediate finality from ZK rollup architecture.

## Strengths

- Production-ready with mature ZK technology and enterprise compliance features
- Advanced cryptography using UltraPlonk proofs eliminating trusted setup requirements
- Built-in X509 certificate validation and selective disclosure for regulatory compliance
- Immediate finality from pure ZK rollup architecture (no optimistic challenge periods)

## Risks and open questions

- Extremely high compute requirements (144 cores, 750GB RAM) limit proposer decentralization
- Complex infrastructure requirements may limit deployment scenarios
- Limited composability compared to general-purpose privacy L2s

## Links

- [Nightfall v4 GitHub](https://github.com/EYBlockchain/nightfall_4_CE)

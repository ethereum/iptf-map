---
title: "Vendor: iExec"
status: draft
maturity: mainnet
---

# iExec – Confidential Computing & Off-Chain Execution (TEE-Based Verifiable Compute for EVM)

## What it is

iExec provides privacy tools that bring privacy-preserving computation, data governance, and trusted execution to your apps, powered by a decentralized network of **Trusted Execution Environments (TEEs)**.

## Fits with patterns

- [Pattern: TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md) - TEE-backed tasks execute securely off-chain with attested results on-chain; core fit for iExec’s enclave-based compute
- [Pattern: Attestation verifiable on-chain](../patterns/pattern-verifiable-attestation.md) - Cryptographic attestation proves expected code ran in a genuine enclave; verified results are consumed on-chain
- [Pattern: Hybrid TEE + ZK Settlement](../patterns/pattern-tee-zk-settlement.md) - Private settlement and matching inside TEEs with ZK proofs for on-chain verifiability; iExec supports hybrid TEE+ZK
- [Pattern: TEE key manager](../patterns/pattern-tee-key-manager.md) - Keys and secrets used only inside secure enclaves; aligns with iExec’s confidential execution model
- [Pattern: Pre-trade privacy (Shutter/SUAVE/private RFQ)](../patterns/pattern-pretrade-privacy-encryption.md) - Sealed-bid and private RFQ flows; bids processed confidentially off-chain in TEEs, settlement revealed on-chain
- [Pattern: Low-cost L2 + Off-chain Encrypted Audit Log](../patterns/pattern-l2-encrypted-offchain-audit.md) - Off-chain encrypted execution with verifiable audit trail; fits confidential compute and attested logs
- [Pattern: Permissioned Ledger Interoperability](../patterns/pattern-permissioned-ledger-interoperability.md) - Bridge enterprise systems and permissioned ledgers with confidentiality and compliance; iExec’s TEEs support hybrid Web2/Web3 workflows

## Not a substitute for

- Fully Homomorphic Encryption (FHE)-based on-chain privacy (e.g., fhEVM)
- ZK-based shielded L2s (e.g., Aztec)
- Pure MPC-based decentralized compute networks

## Architecture

Smart contracts emit task requests that are matched via the iExec marketplace. A worker node executes the task inside a **Trusted Execution Environment**. A cryptographic attestation proves the expected code was executed inside a genuine secure enclave; the verified result is returned on-chain. Core components include PoCo (Proof-of-Contribution), TEE-enabled worker nodes (Intel SGX), decentralized marketplace for compute/data/apps, on-chain verification, and the RLC token for payments and staking.

## Privacy domains

- TEE-based confidentiality: data decrypted only inside secure enclaves, never exposed in plaintext to infrastructure operators.
- Code confidentiality: application logic can be protected and executed privately within enclaves.
- Supports hybrid models (ZK proofs for output verification, on-chain settlement, off-chain AI pipelines, enterprise compliance).

## Enterprise demand and use cases

- Financial institutions and DeFi seeking **verifiable off-chain confidentiality** with attested settlement.
- Confidential portfolio computation, risk analysis, private liquidations, sealed-bid auctions.
- AI & data marketplaces: secure dataset monetization, confidential AI inference.
- Web3 x Web2 integration: secure SaaS automation, enterprise data bridges, confidential API orchestration.

## Technical details

- Ethereum-compatible, live on mainnet
- Intel SGX-based TEE infrastructure
- JavaScript / TypeScript SDKs, smart contract integration tooling
- Decentralized task marketplace, RLC utility token

## Strengths

- Production-ready infrastructure
- Enterprise-grade hardware-backed security
- Verifiable off-chain execution
- Strong positioning at the intersection of AI and Web3
- Real-world enterprise integration capabilities

## Risks and open questions

- Reliance on hardware security assumptions (Intel SGX trust model)
- Centralization considerations around TEE hardware supply
- Performance constraints for heavy workloads
- Evolving regulatory landscape for confidential compute

## Links

- [https://iex.ec](https://iex.ec)
- [https://github.com/iExecBlockchainComputing](https://github.com/iExecBlockchainComputing)
- [https://docs.iex.ec](https://docs.iex.ec)
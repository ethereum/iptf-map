---
title: "Vendor: Peer"
status: draft
---

# Peer (ex-ZKP2P) - Peer-to-peer fiat onramp using zk-TLS and TEE attestations

## What it is

Peer (ex-ZKP2P) is an open-source protocol that enables peer-to-peer fiat-to-crypto swaps by proving fiat payments were completed on instant payment rails (Venmo, Revolut, and others). V3 uses a modular verification architecture: a TEE attestation service validates zk-TLS proofs offchain and emits EIP-712 payment attestations, which a Unified Payment Verifier contract checks onchain before releasing escrowed crypto.

## Fits with patterns (names only)

- [TLS Payment Bridge](../patterns/pattern-tls-payment-bridge.md)
- [zk-TLS](../patterns/pattern-zk-tls.md)
- [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)
- [Shielding](../patterns/pattern-shielding.md)

## Not a substitute for

- Full bank-grade AML/KYC infrastructure
- Institutional settlement systems with formal clearing
- Fiat custody or banking-as-a-service

## Architecture

- **Modular contract design (V3)**: Separated into an **Escrow Contract** (deposit configuration, fund locking) and an **Orchestrator Contract** (intent lifecycle, fee distribution, post-settlement hooks). Liquidity providers can update rates, currencies, and payment methods without creating new vaults.
- **TEE attestation service**: V3 moves proof verification offchain to a TEE attestation service (e.g. Phala) that validates zk-TLS proofs and emits standardized EIP-712 payment attestations. Rotating attestors and onchain membership checks distribute trust across multiple operators.
- **Unified Payment Verifier**: A single onchain verifier checks EIP-712 signatures, amounts, and replay protection.
- **Vendor-agnostic verification**: Supports multiple zk-TLS backends (TLSNotary, Primus, ZKEmail) as part of a progressive decentralization roadmap.
- **Orderbook model**: Liquidity providers post onchain orders specifying accepted payment rails, exchange rates, and limits. Takers browse and select orders.

## Enterprise demand and use cases

- **Retail onramping**: Users in markets with instant payment rails (Brazil/PIX, India/UPI, US/Venmo) can onramp to stablecoins without centralized exchanges.
- **Emerging market access**: Enables fiat-to-crypto conversion where centralized exchange infrastructure is limited.
- **Permissionless liquidity**: Anyone can become a liquidity provider by depositing crypto into the escrow contract.

## Technical details

- **Proof system**: Vendor-agnostic — supports TLSNotary, Primus, and ZKEmail as proof backends. TEE attestation service validates proofs and produces EIP-712 attestations.
- **Supported rails**: Venmo, Revolut, and additional payment providers supported via the V3 unified verification architecture.
- **Settlement chain**: Ethereum and L2s.
- **Client-side**: Browser extension handles TLS session co-signing and proof generation.
- **Partial releases**: V3 supports partial payment releases, resolving cross-currency payment errors.

## Strengths

- Fully open-source protocol and client tooling
- No custodial intermediary — settlement is peer-to-peer with onchain escrow
- Payment privacy preserved — zero-knowledge proofs reveal necessary payment attributes without exposing full account details
- Extensible to payment rails with TLS-accessible confirmation endpoints
- Permissionless participation for both liquidity providers and takers

## CROPS profile

| Product | CR     | OS  | Privacy | Security | Context |
| ------- | ------ | --- | ------- | -------- | ------- |
| Peer    | medium | yes | partial | medium   | i2u     |

- **CR**: Medium — onchain escrow is permissionless, but Notary availability and payment rail access can vary by geography.
- **OS**: Yes — protocol, contracts, and client code are open source under MIT license ([zkp2p-contracts](https://github.com/zkp2p/zkp2p-contracts)).
- **Privacy**: Partial — payment proofs hide full account details, but onchain escrow transactions are visible. Amounts and participant addresses are public unless combined with shielding.
- **Security**: Medium — security depends on TEE attestation service integrity, underlying zk-TLS trust model, escrow contract correctness, and payment rail API stability.

## Risks and open questions

- **TEE trust**: V3 relies on TEE attestation services for offchain proof verification. TEE hardware vulnerabilities (side-channel attacks, firmware exploits) could compromise attestation integrity.
- **Attestor centralization**: Although rotating attestors distribute trust, the attestor set must be managed — a compromised or colluding majority could produce false attestations.
- **Notary trust**: Underlying zk-TLS still requires a trusted Notary to co-sign TLS sessions. Malicious or compromised Notary can forge proofs or deny service.
- **Payment rail stability**: Changes to payment provider APIs or TLS configurations can break proof generation.
- **Regulatory uncertainty**: P2P fiat-to-crypto onramps may face regulatory scrutiny depending on jurisdiction.
- **Post-quantum exposure**: Inherits zk-TLS vulnerability to CRQC via ECDH-based MPC/2PC. See [Post-Quantum Threats](../domains/post-quantum.md).

## Links

- GitHub: https://github.com/zkp2p
- TLSNotary: https://tlsnotary.org/

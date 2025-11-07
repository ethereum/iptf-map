---
title: "Private Authentication & Interaction of Client EOAs"
primary_domain: Identity & Compliance
secondary_domain:
---

## 1) Use Case

Institutions that interact with client EOAs must verify identity and key control while protecting client privacy. The solution enables proving KYC compliance and address ownership without exposing personal information or linking multiple addresses belonging to the same client.

## 2) Additional Business Context

**See confidential context:** [context/use-cases/context-private-auth.md](../../context/use-cases/context-private-auth.md)

## 3) Actors

Issuer (bank/institution) · Clients (EOA owners, investors) · Regulator (audit body) · Wallet (proof generation frontend)

## 4) Problems

### Problem 1: Authentication Without Identity Leakage

Current authentication methods (e.g., message signatures) prove key control but expose addresses and create linkability between clients and institutions. Two distinct but related needs emerge:

1. **Authentication**: user proves they are a client of an institution (on- or off-chain) without revealing identity.
2. **Interaction privacy**: prevent onchain linkability between client addresses and institutional contracts.

**Requirements:**

- **Must hide:** client identities, links between institutions and users, links between user EOAs
- **Public OK:** registry root, institutional contract addresses, [compliance attestations](../patterns/pattern-verifiable-attestation.md)
- **Regulator access:** scoped access to Merkle inclusion proofs, registry updates, or decryption keys where required
- **Settlement:** proof verification + transaction execution
- **Ops:** resilience against replay attacks; low-cost proof generation; interop across rollups

## 5) Recommended Approaches

See detailed solution architecture and trade-offs in [**Approach: Private Authentication**](../approaches/approach-private-auth.md).

## 6) Open Questions

- How practical is it to prove ownership of multiple EOAs derived from the same seed?
- Should multi-ownership proofs be handled at the wallet layer (BIP-32 style derivations) or at the protocol layer (aggregated ZK proofs)?

## 7) Notes And Links

- **Standards:** [ERC-3643 ONCHAINID](https://www.erc3643.org/)

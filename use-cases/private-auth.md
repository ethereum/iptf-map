---
title: "Private Authentication & Identity Verification"
primary_domain: Identity & Compliance
secondary_domain: Governance
---

## 1) Use Case

Prove membership, eligibility, or attribute possession on-chain without revealing identity or creating linkable activity. Applies to financial compliance (KYC registry membership), governance (anonymous voting), national identity (selective disclosure from government documents), and community membership (sybil-resistant access).

## 2) Additional Business Context

**Confidential context:** Available in private IPTF repo

**Validated deployments:**

- **National identity:** ZKPassport used in Aztec token sale (120+ country passports, NFC + Noir circuits); Anon Aadhaar
- **Governance:** NounsDAO Private Voting (Aztec + Noir storage proofs); MACI deployed at ETHDam, ETHMexico, ETH Tegucigalpa (anti-collusion)
- **Community/sybil:** Zupass PCD framework (Zuzalu, Devcon); World ID (25M+ registrations)
- **Email identity:** zkEmail (DKIM proofs, email wallets on Arbitrum)

## 3) Actors

Credential Issuer (bank, government, DAO, university) · Prover / Subject (investor, citizen, voter, community member) · Verifier (smart contract, institution, election system) · Registry Operator (maintains on-chain commitment: Merkle root, attestation registry, membership set) · Auditor / Regulator (entity with scoped disclosure rights: financial regulator, election observer) · Wallet / Proof Agent (client-side proof generation: mobile wallet, browser extension, NFC reader)

## 4) Problems

### Problem 1: Authentication Without Identity Leakage

Current authentication methods (e.g., message signatures) prove key control but expose addresses and create linkability between provers and verifiers. Two distinct but related needs emerge:

1. **Authentication**: prover demonstrates membership or attribute possession without revealing identity.
2. **Interaction privacy**: prevent on-chain linkability between prover addresses and verifier contracts.

**Requirements:**

- **Must hide:** prover identities, links between verifiers and provers, links between prover EOAs
- **Public OK:** registry roots, verifier contract addresses, [compliance attestations](../patterns/pattern-verifiable-attestation.md)
- **Auditor access:** scoped access to Merkle inclusion proofs, registry updates, or decryption keys where required
- **Settlement:** proof verification + transaction execution
- **Ops:** resilience against replay attacks; low-cost proof generation; interop across rollups; proof generation on consumer hardware

### Problem 2: Credential Source Diversity

Different domains require different credential sources: government-issued IDs (passports, national IDs), institutional attestations (KYC providers), biometric enrollment, email ownership (DKIM), event attendance, and on-chain history. No single canonical identity system covers all use cases.

**Requirements:**

- Must support: document-based (passport NFC), attestation-based (EAS/VC), biometric-enrollment-based, email-based (DKIM), membership-based (Merkle tree), TLS-based (web2 data export)
- Must not require: a single canonical identity system or global registry
- Interop: credentials from different sources should be composable (e.g., prove KYC + jurisdiction + accreditation from different issuers in one proof)

### Problem 3: Sybil Resistance Without Surveillance

Systems that distribute value (governance votes, token distributions) must prevent double-claiming without building a surveillance database. This requires deterministic, scope-bound nullifiers that prevent repeat actions without linking to the underlying identity.

**Requirements:**

- Must prevent: double-claiming, double-voting, distribution farming
- Must preserve: unlinkability across different scopes/services
- Must handle: revocation of compromised credentials without re-identifying holders
- Reference: [vOPRF Nullifiers pattern](../patterns/pattern-voprf-nullifiers.md) for nullifier generation primitives

## 5) Recommended Approaches

| Credential Source | Primary Approach | Example Deployments |
| --- | --- | --- |
| Institutional KYC registry | Merkle tree membership proofs | ERC-3643 issuances, Semaphore |
| Government ID (passport) | Document ZK proofs (NFC + Noir) | ZKPassport / Aztec token sale |
| Government ID (national) | Document DKIM/signature + ZK | Anon Aadhaar / ETHIndia |
| Email | DKIM signature proofs | zkEmail / Arbitrum wallets |
| Web2 data source | TLS transcript proofs | TLSNotary |
| Biometric enrollment | Iris/face hash + membership proof | World ID |
| Event/community | PCD framework | Zupass / Devcon |
| Multi-party private inputs | Collaborative proving (co-SNARK) | TACEO |
| On-chain attestation | EAS / ONCHAINID / W3C VC | Tokeny, EAS |

See detailed architecture and trade-offs in [**Approach: Private Authentication**](../approaches/approach-private-auth.md).

## 6) Open Questions

1. How practical is it to prove ownership of multiple EOAs derived from the same seed without revealing derivation patterns?
2. Should multi-ownership proofs be handled at the wallet layer (BIP-32 style derivations) or at the protocol layer (aggregated ZK proofs)?
3. How to establish cross-credential interoperability, e.g., combine a ZKPassport proof with an institutional attestation in a single transaction?
4. What trust models are acceptable for biometric enrollment systems in different regulatory contexts?
5. How to handle credential revocation across heterogeneous issuers without a central revocation authority?

## 7) Notes And Links

- **Standards:** [ERC-3643 ONCHAINID](https://www.erc3643.org/), [EAS](https://attest.org/), W3C Verifiable Credentials, [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564)
- **ZK Frameworks:** [Semaphore](https://semaphore.pse.dev/), [Noir/Barretenberg](https://docs.aztec.network/), [Circom/Groth16](https://docs.circom.io/)
- **Credential Systems:** [ZKPassport](https://zkpassport.id/), [Anon Aadhaar](https://github.com/anon-aadhaar), [zkEmail](https://prove.email/), [TLSNotary](https://tlsnotary.org/), [Zupass](https://zupass.org/), [MACI](https://maci.pse.dev/)
- **Validated Deployments:** [WFP Building Blocks](https://www.wfp.org/building-blocks), [OpenCerts](https://www.opencerts.io/)
- **Related Patterns:** [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [zk-TLS](../patterns/pattern-zk-tls.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [co-SNARK](../patterns/pattern-co-snark.md)

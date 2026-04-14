---
title: "Resilient Identity Continuity"
primary_domain: identity
secondary_domain: compliance
---

## 1) Use Case

Maintain the ability to prove identity attributes on-chain after the original credential issuer becomes unavailable, hostile, or ceases to exist. Extends [Private Identity](private-identity.md) to an issuer-hostile threat model: the issuer may refuse new issuance, mass-revoke credentials, publish false revocation lists, or go permanently offline. Holders need credential survival, recovery without issuer cooperation, and verification that requires no issuer or registry contact.

## 2) Additional Business Context

**Related work and deployments:**

- **Passport enrollment:** [ZKPassport](https://zkpassport.id/) (120+ country passports, NFC + Noir); [Self](https://self.xyz/)
- **National ID:** [Anon Aadhaar](https://github.com/anon-aadhaar) (Indian Aadhaar, RSA signature verification)
- **Biometric:** [World ID](https://worldcoin.org/world-id) (25M+ registrations)
- **Merkle membership:** [Semaphore](https://semaphore.pse.dev/) (PSE)
- **Email identity:** [zkEmail](https://prove.email/) (DKIM proofs)
- **TLS proofs:** [TLSNotary](https://tlsnotary.org/) (web2 data export)

## 3) Actors

Holder (identity owner: enrolls once, proves attributes at will) · Identity Source (government document, email provider, biometric system, community attestation, civil registry) · Enrollment Operator (sybil-resistant enrollment gating, may be distributed) · Verifier (smart contract, institution, or dApp that checks proofs) · Auditor / Regulator (entity with scoped disclosure rights) · Governance Operator (manages on-chain trust anchor and operational parameters)

## 4) Problems

### Problem 1: Credential Survival After Issuer Failure

Credential systems today depend on a live, cooperative issuer for revocation checks, re-issuance, and status queries. If the issuer goes offline, mass-revokes, publishes false revocation lists, or becomes adversarial, holders lose the ability to prove legitimately issued attributes. This is a single point of failure across all issuer-dependent identity systems.

**Requirements:**

- **Must survive:** issuer shutdown, mass revocation, adversarial behavior (false status reports, credential forgery for non-holders, refusal of new issuance)
- **Must support:** continued proof generation and verification after issuer destruction; new enrollments without the original issuer
- **Must not require:** issuer online status for any post-enrollment operation
- **Must hide:** holder identity, credential contents, issuer-holder relationship
- **Public OK:** trust anchor state (e.g., commitment root), proof validity (pass/fail), scope-bound nullifiers
- **Auditor access:** selective disclosure grants scoped read access to specific credential attributes or proof metadata
- **Ops:** proof generation practical on consumer hardware; verification completable in a single on-chain transaction

### Problem 2: Credential Source Diversity

Passport-based enrollment excludes populations without biometric passports. An identity system designed for adversarial conditions is weakest for those who need it most if it depends on a single document type. Multiple enrollment paths are required: government-issued IDs, biometric enrollment, email, web2 data export, community attestation, and civil registry records.

**Requirements:**

- Must support: document-based (passport NFC, national ID), biometric-enrollment-based, email-based (DKIM), TLS-based (web2 data export), community attestation, civil registry
- Must not require: any single credential source as mandatory
- Sybil resistance: per-source mechanisms must prevent duplicate enrollment within a source type
- Interop: credentials from different sources should be composable where possible
- **Constraints:** some sources require the identity provider's cryptographic infrastructure to have existed at some prior point

### Problem 3: Recovery Without Issuer Cooperation

Key loss in issuer-independent systems is permanent unless recovery mechanisms exist. Traditional recovery flows depend on the issuer re-issuing credentials. When the issuer is unavailable, hostile, or destroyed, holders need alternative paths to restore their ability to prove identity attributes.

**Requirements:**

- Must support: threshold recovery (secret sharing across devices or custodians)
- Must support: social recovery (guardian-based, quorum-authorized key rotation)
- Must not require: issuer participation in any recovery flow
- Anti-coercion: recovery participants cannot be compelled to reveal which holder they are protecting
- **Constraints:** recovery must not create a duplicate identity; must bind to the holder's original enrollment

### Problem 4: Universal Verification Without Registry or Issuer Contact

Verification in existing private identity systems often requires contacting a registry operator or issuer for revocation checks or credential status. In an issuer-hostile setting, verification must work with only the on-chain trust anchor and a ZK proof. No external calls.

**Requirements:**

- **Must support:** any verifier (on-chain or off-chain) with no issuer or registry contact
- **Must support:** degraded operation (holder generates proofs locally; verifier checks against a cached or on-chain trust anchor)
- **Must preserve:** unlinkability across verifiers and sessions
- **Ops:** verification gas costs practical for frequent access checks; scope-bound nullifiers prevent replay without linking proofs

## 5) Recommended Approaches

| Challenge | Strategy | Key Property |
| --- | --- | --- |
| Credential anchoring | On-chain commitment via distributed enrollment | No issuer dependency after enrollment |
| Sybil resistance | Layered (cryptographic + economic + social) | Degrades gracefully when credential sources are compromised |
| Recovery | Threshold (Shamir) + social (guardian-based) | No issuer participation required |
| Verification | Universal (on-chain trust anchor + ZK proof) | Any verifier, no registry contact |

See [**Approach: Private Identity, Section F**](../approaches/approach-private-identity.md#f-issuer-independent-enrollment-via-distributed-oprf) for detailed architecture and trade-offs.

## 6) Open Questions

1. What is the minimum guardian set size for social recovery that provides anti-coercion guarantees without excessive coordination overhead?
2. How does recovery interact with the original enrollment? Can a recovered identity reuse original identifiers, or must new ones be derived deterministically?
3. How do identity sources that require prior provider infrastructure handle retroactive deletion of cryptographic evidence by the provider?
4. What models enable credential attribute freshness without an issuer to refresh them (e.g., expired passports, changed nationality)?
5. What is the production path for private predicate parameters, so that verification transactions do not leak which attribute is being queried?

## 7) Notes And Links

- **Extends:** [Private Identity](private-identity.md) (drops the cooperative-issuer assumption)
- **PoC:** [Resilient Private Identity](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity)
- **Standards:** [RFC 9497 (OPRF)](https://www.rfc-editor.org/rfc/rfc9497), [RFC 9380 (hashToCurve)](https://www.rfc-editor.org/rfc/rfc9380), [W3C VC Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- **Credential Systems:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Anon Aadhaar](https://github.com/anon-aadhaar), [World ID](https://worldcoin.org/world-id), [zkEmail](https://prove.email/), [TLSNotary](https://tlsnotary.org/), [Semaphore](https://semaphore.pse.dev/), [Holonym](https://holonym.id/)
- **Related Patterns:** [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [zk-TLS](../patterns/pattern-zk-tls.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)
- **Prior Art:** [zk-creds (Rosenberg et al., 2023)](https://eprint.iacr.org/2022/878), [zk-promises (Shih et al., 2025)](https://eprint.iacr.org/2024/1260)
- **Allies:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Aztec](https://aztec.network/), [Anon Aadhaar](https://github.com/anon-aadhaar), [World ID](https://worldcoin.org/world-id), [Semaphore](https://semaphore.pse.dev/)

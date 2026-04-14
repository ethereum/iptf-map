# Approach: Resilient Identity Continuity

**Use Case Link:** [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md)

**High-level goal:** Enable holders to prove identity attributes on Ethereum after the credential issuer becomes unavailable, hostile, or destroyed. The trust anchor shifts from issuer to on-chain state. Recovery and verification operate without issuer participation.

## Overview

### Problem Interaction

Resilient identity continuity addresses four interconnected challenges:

1. **Credential Survival vs. Issuer Dependency**: Once credentials are anchored to on-chain state, the issuer exits the verification loop entirely. But this means revocation must also be issuer-independent (self-revocation via stake withdrawal, or governance-gated). The anchor becomes the single source of truth, not the issuer.

2. **Source Diversity vs. Sybil Resistance**: Supporting multiple enrollment paths (passports, national IDs, biometric, email, community attestation) increases population coverage but complicates sybil resistance. Each source type has different forgery costs, uniqueness guarantees, and availability constraints. Per-source sybil gates are necessary. Cross-source sybil resistance is handled by restricting enrollment to a single source type per deployment.

3. **Recovery vs. Identity Binding**: Recovery must restore the holder's ability to prove attributes without creating a duplicate identity. This requires binding recovery to the holder's original enrollment. Neither threshold (Shamir) nor social (guardian) recovery should involve the issuer.

4. **Universal Verification vs. Freshness**: Verification without issuer contact requires verifiers to check proofs against on-chain state alone. A bounded window of valid roots (circular buffer) tolerates churn from new enrollments. Holders refresh their proof material locally from public events.

### Key Constraints

- Trust anchor is on-chain state; no issuer, registry, or third-party contact after enrollment
- Unlinkability across verifiers and sessions; proof generation on consumer hardware
- Multiple credential source types; no single source mandatory
- Recovery must not create duplicate identities; guardian recovery must have anti-coercion properties
- Per-source sybil enforcement; economic fallback when sources are compromised

### TLDR for Different Personas

- **Business:** Identity proofs survive issuer shutdown, sanctions, or hostile behavior. No vendor lock-in. Multiple enrollment paths. Recovery without the failed issuer.
- **Technical:** On-chain root as sole trust anchor after distributed enrollment. ZK membership proofs + scope-bound nullifiers for unlinkable verification. Threshold and social recovery, not issuer re-issuance.
- **Legal:** Selective disclosure and on-chain audit trails. Identity continuity across jurisdictional disruptions. Anti-coercion properties in recovery.

## Architecture and Design Choices

### Approaches by Strategy

| Approach | Strategy | Trust Assumption | Issuer Dependency | Maturity |
| --- | --- | --- | --- | --- |
| [On-chain commitment via distributed OPRF](#a-on-chain-commitment-via-distributed-oprf) | Anchor credentials to Merkle root via threshold OPRF enrollment | MPC honest-threshold | None after enrollment | PoC |
| [Distributed re-issuance](#b-distributed-re-issuance) | Replace failed issuer with threshold committee | Committee honest-threshold | Committee availability | Concept |
| [TEE-based credential vault](#c-tee-based-credential-vault) | Hardware enclave stores credential material | TEE manufacturer + enclave integrity | None if TEE persists | PoC |

---

### A. On-Chain Commitment via Distributed OPRF

**Primary Pattern:** [Private MTP Authentication](../patterns/pattern-private-mtp-auth.md)
**Supporting Patterns:** [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)

Holders prove real-world identity ownership (passport NFC, national ID, email DKIM, TLS transcript, biometric, community attestation) and obtain a deterministic evaluation from a distributed OPRF network. The OPRF output produces an enrollment nullifier (one per real-world identity) and a leaf commitment inserted into an on-chain incremental Merkle tree. After enrollment, the on-chain root is the sole trust anchor.

**Enrollment paths:**

| Source | Mechanism | Trust Assumption | Coverage |
| --- | --- | --- | --- |
| Passport (NFC) | [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/) | Document issuer | 120+ countries |
| National ID | [Anon Aadhaar](https://github.com/anon-aadhaar) | National ID authority (RSA signature) | India |
| Biometric | [World ID](https://worldcoin.org/world-id) | Enrollment operator | Limited locations |
| Email | [zkEmail](https://prove.email/) | Email provider (DKIM key) | Universal (email users) |
| Web2 data | [TLSNotary](https://tlsnotary.org/) | Notary + TLS server | Any web2 source |
| Community | Attestation + vouch | Existing members | Deployed communities |
| Civil registry | Government registry attestation + ZK | Registry operator | Jurisdiction-dependent |

**Sybil resistance (layered):**

| Layer | Mechanism | What It Bounds | Assumption |
| --- | --- | --- | --- |
| Cryptographic | Distributed OPRF enrollment nullifier | One enrollment per source credential | Source credentials are unique and unforgeable |
| Economic | Refundable stake per enrollment | Capital lockup per identity (N sybils = N * stake) | Attacker capital is finite |
| Social (future) | Web-of-trust vouching | Amplification bounded by social reach | Social graph not fully captured by attacker |

When sources are honest, the cryptographic layer enforces one-to-one binding. When sources are compromised, the economic layer shifts to capital-bounded plural identity.

**Recovery:**

- **Threshold (Shamir):** Secret split across devices or custodians (t-of-n). Recovered secret produces the same proofs. No on-chain transaction required.
- **Social (guardian-based):** Quorum of guardians authorizes key rotation under same enrollment. Anti-coercion mechanism is an open design question.

**Verification:** Any verifier checks a ZK proof against the on-chain root. Public inputs: root, scope-bound nullifier, predicate parameters. No registry lookup, no issuer contact.

**When to use:** Issuer may become unavailable, hostile, or destroyed. Sanctions compliance across jurisdictional disruptions. Multi-source enrollment with issuer-free verification.
**Deployment:** [Resilient Private Identity PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity) (Noir/UltraHonk, BN254)
**Limitations:** Requires a distributed OPRF network (liveness depends on threshold availability). OPRF network operators accumulate enrollment metadata (mitigated by anonymous communication). Recovery adds complexity and coordination overhead. Predicate parameters are public inputs in the PoC (production: private predicate circuits).

### B. Distributed Re-Issuance

Replace the failed issuer with a threshold committee (t-of-n key shares) that can produce valid credentials for holders who present qualifying evidence. New credentials must be recognizable by existing verifiers.

**When to use:** Verifiers expect issuer-signed credentials rather than commitment-based proofs. Issuer's signing authority needs to be preserved.
**Limitations:** Committee sees credential content during re-issuance (privacy regression). Bootstrapping a trusted committee after issuer failure is an open problem. Distributes the single-point-of-failure rather than eliminating it.

### C. TEE-Based Credential Vault

Hardware enclave stores credential material that survives issuer destruction. TEE generates proofs on demand via remote attestation, without exposing credentials to the host.

**Primary Pattern:** [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)

**When to use:** Hardware trust is acceptable. Strong key management requirements.
**Limitations:** TEE manufacturer trust and supply chain risk. Vendor lock-in. Side-channel vulnerabilities undermine the model. Less decentralized than on-chain commitment approaches.

---

### Vendor Recommendations

| Category | Vendors / Frameworks | Status |
| --- | --- | --- |
| Passport enrollment | [ZKPassport](https://zkpassport.id/) (Noir/Barretenberg), [Self](https://self.xyz/), [Rarimo](https://rarimo.com/) | Pilot |
| National ID | [Anon Aadhaar](https://github.com/anon-aadhaar) (Circom) | Pilot |
| Biometric | [World ID](https://worldcoin.org/world-id) | Pilot |
| Merkle membership | [Semaphore](https://semaphore.pse.dev/) (PSE) | Pilot |
| ZK framework | [Noir/Barretenberg](https://docs.aztec.network/) (Aztec) | PoC |
| OPRF | Custom (RFC 9497 + Jarecki threshold extension) | PoC |
| Email ZK | [zkEmail](https://prove.email/) | Pilot |
| TLS proofs | [TLSNotary](https://tlsnotary.org/) | PoC |
| TEE | Intel SGX, ARM TrustZone, AWS Nitro Enclaves | Production (general); PoC (identity) |

### Implementation Strategy

**Phase 1: Single-Source Pilot**

- Single credential source (e.g., passport NFC via ZKPassport)
- Distributed OPRF enrollment with threshold MPC
- On-chain Merkle root as trust anchor
- Basic verification: ZK membership proof + scope-bound nullifier
- Refundable stake as economic sybil gate

**Phase 2: Multi-Source + Recovery**

- Additional enrollment paths (Anon Aadhaar, zkEmail, TLSNotary)
- Shamir secret sharing for threshold recovery
- Guardian-based social recovery with anti-coercion (mechanism TBD)
- Issuer destruction simulation and continuity demonstration
- Selective disclosure for audit compliance

**Phase 3: Production Hardening**

- L2 deployment for lower verification costs
- Relayer infrastructure for transaction privacy (EIP-4337 paymaster or purpose-built relay)
- Epoch-based key derivation for forward secrecy
- Web-of-trust vouching as social sybil layer
- Stronger curve migration path (BLS12-381 via EIP-2537)
- Private predicate parameters (universal predicate circuits)

## More Details

### Trade-offs

**Approach Comparison:**

| Dimension | On-Chain Commitment (A) | Distributed Re-Issuance (B) | TEE Vault (C) |
| --- | --- | --- | --- |
| Issuer dependency | None after enrollment | Committee availability | TEE availability |
| Privacy | High (ZK proofs, unlinkable) | Medium (committee sees credentials) | Medium (TEE operator sees nothing, but TEE trust) |
| Sybil resistance | Layered (crypto + economic + social) | Depends on committee verification | Depends on TEE integrity |
| Decentralization | On-chain root, distributed OPRF | Distributed committee | Hardware vendor dependency |
| Recovery | Threshold + social, no issuer | Committee re-issues | TEE re-provisions |
| Complexity | High (MPC network, ZK circuits) | Medium (threshold signing) | Medium (TEE integration) |
| Maturity | PoC | Concept | PoC (general TEE); concept (identity) |

**Resilient Identity vs. Private Identity (cooperative issuer):**

| Dimension | Resilient Identity (issuer-hostile) | [Private Identity](approach-private-identity.md) (cooperative issuer) |
| --- | --- | --- |
| Issuer role | None after enrollment | Must remain available for revocation, re-issuance |
| Trust anchor | On-chain state only | Issuer + registry |
| Verification | Any verifier, on-chain root + proof only | May require registry or issuer contact |
| Recovery | Social + threshold, no issuer | Open question (issuer-dependent) |
| Credential sources | Multiple paths via unified architecture | Source-specific approaches |
| Complexity | Higher (MPC, recovery, multi-source) | Lower (single issuer) |

### Open Questions

1. **Guardian recovery design:** What is the minimum guardian set that provides meaningful anti-coercion? What coordination overhead is acceptable for quorum-based recovery?
2. **Recovery-enrollment binding:** Must a recovered identity reuse original enrollment identifiers, or can new ones be derived deterministically from the original?
3. **Attribute freshness:** Without an issuer to refresh attributes, how are stale attributes (expired passports, changed nationality) handled?
4. **Forward secrecy:** The PoC uses a static identity secret. What is the production path for epoch-based key derivation with old-key deletion?
5. **Predicate privacy:** Predicate type, attribute index, and result are visible on-chain per verification. What is the circuit design for private predicate parameters in production?

### Alternative Approaches Considered

**Semaphore (identity commitment only)**

- Trade-off: Established tooling, large anonymity sets vs. no identity-layer sybil resistance
- Status: Production ([Semaphore](https://semaphore.pse.dev/))

**World ID (biometric OPRF)**

- Trade-off: Strongest one-person-one-identity guarantee vs. specialized hardware, centralized enrollment
- Status: Pilot (25M+ registrations)

**PLUME (ECDSA nullifiers)**

- Trade-off: Reuses existing keys vs. no attribute predicates, key-holder proofs only
- Status: PoC (ERC-7524)

**OpenAC (anonymous credentials with ZK)**

- Trade-off: Standards-compatible, no trusted setup vs. assumes cooperative issuer
- Status: PoC (moving to pilot); [paper](https://eprint.iacr.org/2026/251)

**Self-Sovereign Identity (DID/VC without ZK)**

- Trade-off: Simpler UX vs. reveals credential content, relies on issuer availability
- Status: Production (Microsoft ION, Spruce)

## Example Scenarios

### Scenario 1: Sanctioned Jurisdiction

- Institution in a newly sanctioned jurisdiction loses access to Western KYC providers
- Employees enrolled before sanctions retain identity proofs and continue proving compliance attributes
- Verification uses the on-chain root only; no issuer endpoint contacted

### Scenario 2: Issuer Shutdown

- KYC provider goes bankrupt; holders continue generating proofs against the on-chain root
- New enrollees enroll via the distributed OPRF network using self-contained credential sources (passport NFC, email DKIM) that do not depend on the failed issuer
- Verifiers see no disruption

### Scenario 3: Key Recovery After Device Loss

- Holder loses device; reconstructs secret from Shamir shares (threshold) or guardian quorum authorizes key rotation (social)
- Original enrollment preserved; no duplicate identity created

### Scenario 4: Non-Passport Enrollment

- User enrolls via Anon Aadhaar or zkEmail; enrollment protocol identical, only proof source differs
- Proves attributes the same way a passport-enrolled user would

## Links and Notes

- **Extends:** [Private Identity use case](../use-cases/private-identity.md), [Private Identity approach](approach-private-identity.md)
- **PoC:** [Resilient Private Identity](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity)
- **Standards:** [RFC 9497 (OPRF)](https://www.rfc-editor.org/rfc/rfc9497), [RFC 9380 (hashToCurve)](https://www.rfc-editor.org/rfc/rfc9380), [W3C VC Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/), [EIP-196](https://eips.ethereum.org/EIPS/eip-196), [EIP-197](https://eips.ethereum.org/EIPS/eip-197)
- **ZK Frameworks:** [Noir/Barretenberg](https://docs.aztec.network/) (Aztec), [Circom/Groth16](https://docs.circom.io/), [Semaphore](https://semaphore.pse.dev/)
- **Credential Systems:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Rarimo](https://rarimo.com/), [Anon Aadhaar](https://github.com/anon-aadhaar), [World ID](https://worldcoin.org/world-id), [zkEmail](https://prove.email/), [TLSNotary](https://tlsnotary.org/), [Holonym](https://holonym.id/), [OpenAC](https://eprint.iacr.org/2026/251)
- **Related Patterns:** [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [zk-TLS](../patterns/pattern-zk-tls.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [co-SNARK](../patterns/pattern-co-snark.md), [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)
- **Prior Art:** [zk-creds (Rosenberg et al., 2023)](https://eprint.iacr.org/2022/878), [zk-promises (Shih et al., 2025)](https://eprint.iacr.org/2024/1260), [PLUME (Aayush Gupta, ERC-7524)](https://aayushg.com/thesis.pdf), [OpenAC (2026)](https://eprint.iacr.org/2026/251)
- **Allies:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Aztec](https://aztec.network/), [Anon Aadhaar](https://github.com/anon-aadhaar), [World ID](https://worldcoin.org/world-id), [Semaphore](https://semaphore.pse.dev/)

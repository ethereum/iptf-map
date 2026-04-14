# Approach: Private Identity

**Use Case Links:** [Private Identity](../use-cases/private-identity.md), [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md)

**High-level goal:** Enable any party (institutions, governments, DAOs) to verify identity claims on Ethereum without exposing the underlying identity, using verification logic that is publicly auditable and cryptographically enforced. Support both cooperative-issuer and issuer-hostile threat models.

## Overview

### Problem Interaction

Private authentication addresses five interconnected challenges:

1. **Identity Verification Without Disclosure**: The fundamental problem across all domains. Proving "I am eligible" without revealing "I am Alice." Traditional authentication (message signatures) satisfies verifiers but exposes identities and creates trackable on-chain patterns.
2. **Credential Source Heterogeneity**: No universal identity system exists. Passports, KYC registries, biometric enrollment, email ownership, event attendance, and on-chain history are all valid credential sources, each with different trust assumptions, coverage, and proof costs.
3. **Sybil Resistance**: Systems that distribute value (votes, tokens) need "one per person" guarantees without building identity databases. Requires deterministic, scope-bound nullifiers.
4. **Regulatory & Audit Compliance**: Financial use cases require selective disclosure and audit trails. All domains need scoped visibility without full identity exposure.
5. **Issuer Independence**: Approaches A-E assume a cooperative issuer. When the issuer becomes unavailable, hostile, or destroyed, credentials anchored to the issuer fail. The trust anchor must shift to on-chain state so holders continue proving attributes without issuer participation.

These problems interact because the same cryptographic primitives (membership proofs, nullifiers, selective disclosure) serve all five challenges across different domains.

### Key Constraints

**Universal:**

- **Unlinkability:** presentations must not be correlatable across verifiers or sessions
- **Openness:** proof systems and verification logic must be open source and auditable
- **Interoperability:** must work across credential formats, chains, and verifier implementations
- **Decentralization:** must not require a single canonical identity provider or central registry
- Must support credential revocation without re-identifying holders
- Proof generation must be practical on consumer hardware

**Financial (additional):**

- Must satisfy institutional KYC/AML compliance requirements
- Must provide regulatory audit trails with selective disclosure

**Governance (additional):**

- Must resist coercion
- Must scale to large anonymity sets without centralized bottlenecks

**Issuer-Hostile (additional):**

- Trust anchor must be on-chain state; no issuer contact after enrollment
- Recovery must not create duplicate identities
- Per-source sybil enforcement with economic fallback when sources are compromised

### TLDR for Different Personas

- **Business:** Verify eligibility claims (KYC status, citizenship, community membership) without exposing personal data. The same primitives serve financial compliance and governance. For issuer-hostile scenarios, identity proofs survive issuer shutdown, sanctions, or hostile behavior.
- **Technical:** Organize by credential source: Merkle tree membership for registries, document ZK for government IDs, DKIM for email, TLS proofs for web2 data. Each has different trust assumptions and proof costs. For issuer independence, a distributed OPRF enrollment anchors credentials to an on-chain root as the sole trust anchor.
- **Legal:** Achieve regulatory compliance through verifiable proofs rather than data collection. Selective disclosure provides cryptographically scoped visibility. Identity continuity across jurisdictional disruptions via on-chain anchoring.

## Architecture and Design Choices

### Approaches by Credential Source

| Approach | Credential Source | Trust Assumption | Proof Cost | Maturity | Key Deployment |
| --- | --- | --- | --- | --- | --- |
| [Merkle tree membership](#a-registry-based-membership-proofs) | Institutional registry | Registry operator | Low | Pilot | Semaphore, ERC-3643 |
| [Document ZK](#b-document-zk-proofs) | Government ID (NFC/signature) | Document issuer | Medium | Pilot | ZKPassport, Anon Aadhaar |
| [zk-TLS](#c-tls-transcript-proofs) | Web2 data source | Notary + TLS server | Medium | PoC | TLSNotary |
| [On-chain attestation](#d-on-chain-attestation) | Trusted issuer | Issuer signing key | Low | Production | EAS, ONCHAINID |
| [POD2](#e-pod2) | Event/community | Attestation issuer | Low | Pilot | [POD2](https://github.com/0xPARC/pod2) (0xPARC) |
| DKIM proofs (email) | Email provider | Email provider DKIM key | Low | Pilot | zkEmail / Arbitrum |
| Biometric enrollment | Enrollment operator | Enrollment device | High (enrollment) | Pilot | World ID (25M users) |
| [Issuer-independent OPRF](#f-issuer-independent-enrollment-via-distributed-oprf) | Multiple (any of the above) | MPC honest-threshold | Medium | PoC | [Resilient Private Identity](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity) |

---

### A. Registry-Based Membership Proofs

**Primary Pattern:** [Private MTP Authentication](../patterns/pattern-private-mtp-auth.md)
**Supporting Patterns:** [ZK-KYC/ML + ONCHAINID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md)

A registry operator (institution, DAO) maintains a Merkle tree of approved members. Provers generate ZK membership proofs demonstrating inclusion in the tree and exclusion from a revocation tree, without revealing which leaf they correspond to. [Semaphore](https://semaphore.pse.dev/) is the most established implementation, using identity commitments as leaves and nullifiers to prevent proof reuse.

**Operator trust assumptions:** The registry operator controls membership (who is added/removed) and can censor by omission (refusing to add legitimate members) or by selective revocation. The operator sees the identity of each member at enrollment time, though not at proof-presentation time. Multi-operator or federated registries can mitigate single-operator risk.

**Core components:**

1. **Registry infrastructure:** Off-chain onboarding, Merkle tree construction with approved addresses, Lean Incremental Merkle tree for revocations, on-chain root commitment with regular updates
2. **ZK proof system:** Membership proofs for inclusion, nullifier system to prevent replay, private key ownership verification within the proof
3. **Integration layer:** Contract hooks for proof verification, ERC-3643 integration for permissioned tokens, [attestation logging](../patterns/pattern-verifiable-attestation.md) for compliance trails, cross-chain registry sync
4. **Audit infrastructure:** Audit trails of registry updates and proof verifications, selective disclosure for regulatory investigations, threshold-based access controls

**When to use:** Institutional KYC/AML compliance, permissioned token transfers, any scenario with a defined membership set managed by a known operator.
**Deployment:** Semaphore
**Limitations:** Requires a trusted registry operator; registry updates introduce latency; Semaphore is one implementation of the Merkle membership pattern, not the only one.

### B. Document ZK Proofs

Document-based ZK proofs read cryptographic data from government-issued identity documents and generate ZK proofs of specific attributes without revealing the full document.

**ZKPassport** reads the NFC chip embedded in biometric passports (120+ countries supported), extracts signed attributes, and uses [Noir](https://docs.aztec.network/) circuits with the Barretenberg (UltraHonk) prover to generate proofs natively on mobile devices. Provers can demonstrate nationality, age, or sanctions-list non-membership without revealing name, passport number, or other fields.

**Validated deployment:** The Aztec token sale (December 2025) used ZKPassport for privacy-preserving sanctions screening. Participants proved their passport data did not match OFAC, Swiss, EU, or UK sanctions lists without revealing any passport details to Aztec or anyone else. Approximately 50% of committed capital came from community participants using this flow.

**Anon Aadhaar** generates ZK proofs of Indian national ID (Aadhaar) attributes. It verifies UIDAI's RSA signature client-side without sending data to any server. EVM-verifiable on-chain.

**When to use:** Sanctions compliance without full KYC, age verification, nationality proofs, any scenario where a government-issued document is the credential source.
**Limitations:** Requires NFC-capable device (ZKPassport) or specific national ID format; limited to countries with supported document cryptography.

### C. TLS Transcript Proofs

**Primary Pattern:** [zk-TLS](../patterns/pattern-zk-tls.md)

[TLSNotary](https://tlsnotary.org/) enables provers to generate ZK proofs over TLS session transcripts, verifying data received from any web2 source (bank portals, government websites, social media) without revealing the full session content. A Notary co-signs the TLS session, and the prover selectively discloses specific fields via ZK proofs.

**When to use:** Porting identity or financial data from web2 into on-chain claims; compliance data export from banking portals; any web2 data that cannot be accessed via API.
**Limitations:** Requires a trusted Notary (trust assumption is an [open question](#open-questions)); session freshness guarantees depend on Notary behavior; selective disclosure granularity depends on TLS record structure.

### D. On-Chain Attestation

**Primary Pattern:** [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)

On-chain attestation systems ([EAS](https://attest.org/), [ONCHAINID](https://www.erc3643.org/) (ERC-734/735), W3C Verifiable Credentials) allow trusted issuers to publish signed claims about subjects. These claims can be verified on-chain with minimal gas cost. When combined with ZK wrappers, attestations support selective disclosure: prove you hold a valid attestation of type X from issuer Y without revealing the specific attestation content.

[OpenAC](https://eprint.iacr.org/2026/251) adds unlinkable presentations over existing VCs (SD-JWT, mDL) using transparent ZK proofs, no issuer changes or trusted setup. PoC with mobile benchmarks; EUDI ARF compatible; moving to pilot.

**When to use:** Permissioned token compliance (ERC-3643), cross-institutional credential sharing, regulatory registry mirroring (e.g., [eWpG bridge](../patterns/pattern-crypto-registry-bridge-ewpg-eas.md)). Add OpenAC when cross-verifier unlinkability is required.
**Deployment:** EAS is production-grade across multiple chains. OpenAC is PoC (moving to pilot).
**Limitations:** Without a ZK presentation layer, issuer linkage remains: the issuer knows which attestations they signed, creating a linkability vector.

### E. POD2

[POD2](https://github.com/0xPARC/pod2) (0xPARC) implements Provable Object Data: any piece of data bundled with a cryptographic proof of its correctness. PODs are composable: event tickets, community badges, poll responses, and access tokens follow the same format, enabling credential-source-agnostic identity.

**When to use:** Event gating, community membership, anonymous polls, composable credential ecosystems, sybil-resistant access control.
**Limitations:** Community-driven tooling; less mature than institutional-grade systems.

### F. Issuer-Independent Enrollment via Distributed OPRF

**Use Case:** [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md)
**Primary Pattern:** [Private MTP Authentication](../patterns/pattern-private-mtp-auth.md)
**Supporting Patterns:** [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)

Approaches A-E assume a cooperative issuer. This approach addresses the issuer-hostile threat model: the issuer may be unavailable, hostile, or destroyed. Credential sources from A-E serve as enrollment inputs, but the trust anchor shifts from the issuer to on-chain state.

Holders prove real-world identity ownership (passport NFC, national ID, email DKIM, TLS transcript, biometric, community attestation) and obtain a deterministic evaluation from a distributed OPRF network. The OPRF output produces an enrollment nullifier (one per real-world identity) and a leaf commitment inserted into an on-chain incremental Merkle tree. After enrollment, the on-chain root is the sole trust anchor. No issuer, registry, or third party is contacted during verification.

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

**Alternative strategies for issuer independence:**

- **Distributed re-issuance:** Replace the failed issuer with a threshold committee (t-of-n key shares) that can produce valid credentials. Limitation: committee sees credential content (privacy regression); bootstrapping a trusted committee after failure is an open problem.
- **TEE-based credential vault:** Hardware enclave stores credential material that survives issuer destruction ([TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)). Limitation: TEE manufacturer trust, vendor lock-in, side-channel risk.

---

### Vendor Recommendations

| Category | Vendors / Frameworks | Status |
| --- | --- | --- |
| Merkle membership | [Semaphore](https://semaphore.pse.dev/) (PSE), [Iden3](https://github.com/iden3) | Pilot |
| Document ZK | [ZKPassport](https://zkpassport.id/) (Noir/Barretenberg), [Anon Aadhaar](https://github.com/anon-aadhaar) (Circom), [Self](https://self.xyz/), [Rarimo](https://rarimo.com/) | Pilot/PoC |
| TLS proofs | [TLSNotary](https://tlsnotary.org/) | PoC |
| On-chain attestation | [EAS](https://attest.org/), [ONCHAINID](https://www.erc3643.org/) (Tokeny), W3C VC | Production |
| Anonymous credentials | [OpenAC](https://eprint.iacr.org/2026/251) (EF/PSE) | PoC |
| POD2 | [POD2](https://github.com/0xPARC/pod2) (0xPARC) | Pilot |
| Email ZK | [zkEmail](https://prove.email/) | Pilot |
| OPRF | Custom (RFC 9497 + Jarecki threshold extension) | PoC |

### Implementation Strategy

**Phase 1: Single-Domain Pilot**

- Choose one credential source and use case (e.g., institutional KYC with Merkle membership, or governance voting with MACI)
- Deploy registry or attestation contracts
- Basic wallet/mobile integration for proof generation
- Single-organization deployment

**Phase 2: Multi-Credential & Cross-Domain**

- Support multiple credential sources in one system (e.g., KYC attestation + passport proof)
- Cross-institutional or cross-organization registry coordination
- EAS-based audit trail infrastructure
- Mobile proof generation for governance use cases

**Phase 3: Issuer-Independent Enrollment**

- Distributed OPRF enrollment with threshold MPC
- On-chain Merkle root as sole trust anchor
- Refundable stake as economic sybil gate
- Additional enrollment paths (Anon Aadhaar, zkEmail, TLSNotary)
- Shamir secret sharing for threshold recovery
- Guardian-based social recovery with anti-coercion (mechanism TBD)

**Phase 4: Ecosystem Integration & Hardening**

- Cross-chain authentication support
- Credential composability (combine proofs from different sources in a single verification)
- L2 deployment for lower verification costs
- Relayer infrastructure for transaction privacy (EIP-4337 paymaster or purpose-built relay)
- Epoch-based key derivation for forward secrecy
- Private predicate parameters (universal predicate circuits)
- Stronger curve migration path (BLS12-381 via EIP-2537)

## More Details

### Trade-offs

**Credential Source Comparison:**

| Source | Privacy Strength | Trust Assumption | UX Burden | Coverage |
| --- | --- | --- | --- | --- |
| Merkle membership | Dependent on k-anonymity | Registry operator | Low (wallet plugin) | Limited to registered users |
| Passport NFC | High (attribute-selective) | Passport issuing country | Medium (NFC reader) | 120+ countries |
| Email DKIM | Medium (email provider sees) | Email provider | Low | Universal (email users) |
| zk-TLS | Medium (notary sees session) | Notary | Medium | Any web2 source |
| Biometric | High (one-per-person) | Enrollment operator | High (enrollment) | Limited enrollment locations |
| On-chain attestation | Low-medium (issuer linkage) | Issuer | Low | Depends on issuer network |
| POD2 | High | Attestation issuer | Low | Community adoption |

**Cooperative vs. Issuer-Hostile:**

| Dimension | Cooperative Issuer (A-E) | Issuer-Independent (F) |
| --- | --- | --- |
| Issuer role | Must remain available | None after enrollment |
| Trust anchor | Issuer + registry | On-chain state only |
| Verification | May require registry or issuer contact | Any verifier, on-chain root + proof only |
| Recovery | Open question (issuer-dependent) | Threshold + social, no issuer |
| Sybil resistance | Depends on credential source | Layered (crypto + economic + social) |
| Complexity | Lower (single issuer) | Higher (MPC, recovery, multi-source) |

**ZK Membership vs Traditional Whitelists:**

- **ZK Benefits:** Complete privacy preservation, no address linkability, censorship-resistant verification
- **Traditional Benefits:** Simpler implementation, lower computational costs, no proof generation UX
- **Recommendation:** ZK for privacy-critical applications, traditional for internal operations

**On-Chain vs Off-Chain Verification:**

- **On-Chain:** Immediate verification, composability with smart contracts, higher costs
- **Off-Chain:** Lower costs, more flexible verification logic, requires trusted verifier
- **Hybrid:** Off-chain proof generation, on-chain verification for critical operations

### Open Questions

1. **Multi-Address Efficiency:** How to efficiently prove ownership of multiple EOAs derived from the same seed without revealing derivation patterns?
2. **Cross-Institution Standards:** Standardization of KYC registry formats and proof verification across different institutions?
3. **Regulatory Recognition:** Legal recognition of ZK proofs as sufficient evidence for compliance purposes?
4. **Scalability:** Handling frequent registry updates and proof verification at institutional scale?
5. **Key Recovery:** Institutional-grade key management while maintaining self-custody principles?
6. **Trust Assumption on Notary:** How to guarantee Notary trustworthiness in zk-TLS deployments?
7. **Cross-Credential Composability:** How to combine proofs from heterogeneous credential sources (e.g., passport + KYC attestation + community membership) in a single verification?
8. **Mobile Proof Generation:** What is the minimum hardware requirement for client-side proof generation on mobile devices?
9. **Credential Revocation:** How to handle revocation across heterogeneous issuers without a central revocation authority?
10. **Guardian Recovery Design:** What is the minimum guardian set that provides meaningful anti-coercion? What coordination overhead is acceptable for quorum-based recovery?
11. **Recovery-Enrollment Binding:** Must a recovered identity reuse original enrollment identifiers, or can new ones be derived deterministically from the original?
12. **Attribute Freshness:** Without an issuer to refresh attributes, how are stale attributes (expired passports, changed nationality) handled?

### Alternative Approaches Considered

**TEE-Based Authentication**

- Use case: Hardware-backed identity verification
- Trade-off: Hardware dependencies and vendor trust vs simplified proof generation
- Pattern: [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md) with remote attestation

**Federated Identity Systems**

- Use case: Cross-institutional identity sharing (OAuth/OIDC-style)
- Trade-off: Operational simplicity vs privacy leakage and centralized dependency
- Status: Legacy approach; does not achieve censorship-resistant or privacy-preserving authentication

**Self-Sovereign Identity (DID/VC without ZK)**

- Use case: W3C DID + Verifiable Credentials presented directly
- Trade-off: Simpler UX but reveals credential content to verifier
- Status: Production (Microsoft ION, Spruce); limited privacy without ZK wrappers

**Semaphore (identity commitment only)**

- Trade-off: Established tooling, large anonymity sets vs. no identity-layer sybil resistance (cannot bind one real-world person to one leaf)
- Status: Production ([Semaphore](https://semaphore.pse.dev/))

**World ID (biometric OPRF)**

- Trade-off: Strongest one-person-one-identity guarantee vs. specialized hardware, centralized enrollment
- Status: Pilot (25M+ registrations)

**PLUME (ECDSA nullifiers)**

- Trade-off: Reuses existing keys vs. no attribute predicates, key-holder proofs only
- Status: PoC (ERC-7524)

**OpenAC (anonymous credentials with ZK)**

- Trade-off: Standards-compatible, no trusted setup vs. assumes cooperative issuer for credential issuance
- Status: PoC (moving to pilot); [paper](https://eprint.iacr.org/2026/251)

## Example Scenarios

### Scenario 1: Tokenized Security Access

- Client wants to purchase institutional bond tokens
- Institution requires KYC verification without learning client identity
- Client generates Semaphore proof of registry membership 
- Contract verifies proof and allows token transfer
- Observer sees transaction but cannot link to specific client

### Scenario 2: Multi-Institution Portfolio

- Client maintains accounts with multiple banks and asset managers
- Each institution has separate KYC registry
- Client proves compliance to each without revealing cross-institutional relationships
- Regulators can audit each registry independently via selective disclosure

### Scenario 3: Anonymous Governance Vote

- DAO conducts binding vote on treasury allocation
- Members prove token-holder status via Merkle membership proof
- MACI-style encrypted vote submission prevents vote buying
- ZK tallying reveals result without revealing individual votes
- Election observer can verify the tally is correct without accessing individual ballots

### Scenario 4: Sanctions Compliance Without Full KYC

- Protocol token sale requires participants to be non-sanctioned but does not require full KYC
- Participants use ZKPassport to prove: (a) passport is valid, (b) holder is not on OFAC/EU/UK sanctions lists, without revealing name, passport number, or nationality
- Proof verified on-chain; token purchase proceeds
- No personal data is collected or stored by the protocol

### Scenario 5: Sanctioned Jurisdiction (Issuer-Hostile)

- Institution in a newly sanctioned jurisdiction loses access to Western KYC providers
- Employees enrolled before sanctions retain identity proofs and continue proving compliance attributes
- Verification uses the on-chain root only; no issuer endpoint contacted

### Scenario 6: Issuer Shutdown (Issuer-Hostile)

- KYC provider goes bankrupt; holders continue generating proofs against the on-chain root
- New enrollees enroll via the distributed OPRF network using self-contained credential sources (passport NFC, email DKIM) that do not depend on the failed issuer
- Verifiers see no disruption

### Scenario 7: Key Recovery and Non-Passport Enrollment (Issuer-Hostile)

- Holder loses device; reconstructs secret from Shamir shares or guardian quorum authorizes key rotation. Original enrollment preserved.
- Separately, a user without a passport enrolls via Anon Aadhaar or zkEmail and proves attributes the same way a passport-enrolled user would.

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-734/735](https://eips.ethereum.org/EIPS/eip-734), [EAS](https://attest.org/), W3C Verifiable Credentials, [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564), [RFC 9497 (OPRF)](https://www.rfc-editor.org/rfc/rfc9497), [RFC 9380 (hashToCurve)](https://www.rfc-editor.org/rfc/rfc9380), [EIP-196](https://eips.ethereum.org/EIPS/eip-196), [EIP-197](https://eips.ethereum.org/EIPS/eip-197)
- **ZK Frameworks:** [Semaphore](https://github.com/semaphore-protocol), [Noir/Barretenberg](https://docs.aztec.network/), [Circom/Groth16](https://docs.circom.io/), [Iden3](https://github.com/iden3)
- **Credential Systems:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Rarimo](https://rarimo.com/), [Anon Aadhaar](https://github.com/anon-aadhaar), [zkEmail](https://prove.email/), [TLSNotary](https://tlsnotary.org/), [POD2](https://github.com/0xPARC/pod2), [OpenAC](https://eprint.iacr.org/2026/251), [Holonym](https://holonym.id/)
- **Validated Deployments:** ZKPassport Aztec sale (120+ countries), Anon Aadhaar, World ID (25M registrations), [OpenCerts](https://www.opencerts.io/) (2M+ certs)
- **Related Patterns:** [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [ZK-KYC/ML + ONCHAINID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md), [zk-TLS](../patterns/pattern-zk-tls.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [co-SNARK](../patterns/pattern-co-snark.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Stealth Addresses](../patterns/pattern-stealth-addresses.md), [ERC-3643 RWA](../patterns/pattern-erc3643-rwa.md), [Compliance Monitoring](../patterns/pattern-compliance-monitoring.md), [Network Anonymity](../patterns/pattern-network-anonymity.md), [Noir Private Contracts](../patterns/pattern-noir-private-contracts.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md), [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)
- **Prior Art:** [zk-creds (Rosenberg et al., 2023)](https://eprint.iacr.org/2022/878), [zk-promises (Shih et al., 2025)](https://eprint.iacr.org/2024/1260), [PLUME (Aayush Gupta, ERC-7524)](https://aayushg.com/thesis.pdf)
- **PoC:** [Resilient Private Identity](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity)
- **Vendors:** [Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md), [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [TACEO](../vendors/taceo-merces.md), [Privacy Pools](../vendors/privacypools.md), [Chainlink ACE](../vendors/chainlink-ace.md), [EY](../vendors/ey.md)
- **Allies:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Aztec](https://aztec.network/), [Anon Aadhaar](https://github.com/anon-aadhaar), [World ID](https://worldcoin.org/world-id), [Semaphore](https://semaphore.pse.dev/)

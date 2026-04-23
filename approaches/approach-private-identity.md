# Approach: Private Identity

**Use Case Links:** [Private Identity](../use-cases/private-identity.md), [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md)

**High-level goal:** Enable any party (institutions, governments, DAOs) to verify identity claims on Ethereum without exposing the underlying identity, using verification logic that is publicly auditable and cryptographically enforced. Support both cooperative-issuer and issuer-hostile threat models.

## Overview

### Problem Interaction

Private authentication addresses five interconnected challenges, all served by overlapping cryptographic primitives (membership proofs, nullifiers, selective disclosure):

1. **Verification Without Disclosure:** Proving "I am eligible" without revealing "I am Alice." Traditional authentication exposes identities and creates trackable on-chain patterns.
2. **Plural Identity:** No universal source. Strong signals (passport, national ID) pull in regulatory cost; weak signals (email, social vouch) are cheap but forgeable. Plural systems treat sources as composable, not substitutable.
3. **Sybil Resistance:** Plural identity and sybil resistance share one mechanism: a per-identity cost curve (roughly N², per [Vitalik's zk-identity framework](https://vitalik.eth.limo/general/2025/06/28/zkid.html)) that keeps legitimate pseudonyms cheap and prices mass sybils out. Implemented via scope-bound nullifiers and layered crypto/economic/social factors.
4. **Regulatory Compliance:** Financial use cases require selective disclosure and audit trails with scoped visibility.
5. **Issuer Independence:** When the issuer becomes unavailable, hostile, or destroyed, the trust anchor must shift to on-chain state (see [Approach F](#f-issuer-independent-enrollment-via-distributed-oprf)).

### Key Constraints

**Universal:** Unlinkability across verifiers/sessions; open-source verification logic; interoperability across credential formats and chains; no single canonical identity provider; revocation without re-identification; proof generation practical on consumer hardware.

**Financial:** KYC/AML compliance; regulatory audit trails with selective disclosure.

**Governance:** Coercion resistance; scalable anonymity sets without centralized bottlenecks.

**Issuer-Hostile:** On-chain trust anchor only (no issuer contact post-enrollment); recovery without duplicate identities; plural enrollment sources with layered (crypto + economic + social) sybil enforcement so no single issuer is load-bearing.

### TLDR for Different Personas

- **Business:** Verify eligibility claims without exposing personal data. Identity proofs survive issuer shutdown or sanctions.
- **Technical:** Organized by credential source (Merkle membership, document ZK, DKIM, TLS, biometric), each with different trust/cost profiles. Issuer independence via threshold vOPRF enrollment ([RFC 9497](https://www.rfc-editor.org/rfc/rfc9497) + [Jarecki et al. threshold extension](https://eprint.iacr.org/2017/363)) anchored to an on-chain root; plural sources mean any one source can fail without breaking the system.
- **Legal:** Compliance through verifiable proofs rather than data collection. Selective disclosure for scoped visibility. On-chain anchoring for identity continuity across jurisdictional disruptions.

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

A registry operator (institution, DAO) maintains a Merkle tree of approved members. Provers generate ZK membership proofs demonstrating inclusion and exclusion from a revocation tree, without revealing which leaf they correspond to. [Semaphore](https://semaphore.pse.dev/) is the most established implementation. The operator controls membership and can censor by omission or selective revocation; multi-operator registries mitigate this.

**Core components:** On-chain root commitment with incremental Merkle tree; ZK membership proofs with nullifiers to prevent replay; contract hooks for verification and [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643) integration; [attestation logging](../patterns/pattern-verifiable-attestation.md) for audit trails.

**When to use:** Institutional KYC/AML, permissioned token transfers, defined membership sets.
**Deployment:** Semaphore
**Limitations:** Trusted registry operator required; registry updates introduce latency.

### B. Document ZK Proofs

ZK proofs over cryptographic data from government-issued identity documents, proving specific attributes without revealing the full document.

**ZKPassport** reads passport NFC chips (120+ countries), uses [Noir](https://docs.aztec.network/)/Barretenberg (UltraHonk) circuits to prove nationality, age, or sanctions-list non-membership on mobile. Validated at the Aztec token sale (December 2025): participants proved non-sanctioned status (OFAC/Swiss/EU/UK) without revealing any passport details.

**Anon Aadhaar** generates ZK proofs of Indian national ID attributes, verifying UIDAI's RSA signature client-side. EVM-verifiable.

**When to use:** Sanctions compliance without full KYC, age/nationality verification, government-document-based credentials.
**Limitations:** Requires NFC-capable device or specific national ID format; limited to supported document cryptography.

### C. TLS Transcript Proofs

**Primary Pattern:** [zk-TLS](../patterns/pattern-zk-tls.md)

[TLSNotary](https://tlsnotary.org/) generates ZK proofs over TLS session transcripts from any web2 source (bank portals, government sites, social media). A Notary co-signs the session; the prover selectively discloses specific fields.

**When to use:** Porting web2 identity/financial data into on-chain claims; data sources without APIs.
**Limitations:** Requires a trusted Notary ([open question](#open-questions)); freshness depends on Notary behavior; disclosure granularity depends on TLS record structure.

### D. On-Chain Attestation

**Primary Pattern:** [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)

Trusted issuers publish signed claims on-chain ([EAS](https://attest.org/), [ONCHAINID](https://www.erc3643.org/) (ERC-734/735), W3C VCs). With [ZK wrappers](../patterns/pattern-zk-wrappers.md), attestations support selective disclosure without revealing content. [OpenAC](https://eprint.iacr.org/2026/251) adds unlinkable presentations over existing VCs (SD-JWT, mDL) with transparent ZK proofs, no trusted setup; EUDI ARF compatible.

**When to use:** Permissioned token compliance (ERC-3643), cross-institutional credential sharing, regulatory registry mirroring. Add OpenAC for cross-verifier unlinkability.
**Deployment:** EAS (production). OpenAC (PoC, moving to pilot).
**Limitations:** Without ZK presentation, issuer linkage remains.

### E. POD2

[POD2](https://github.com/0xPARC/pod2) (0xPARC) implements Provable Object Data: any piece of data bundled with a cryptographic proof of its correctness. PODs are composable: event tickets, community badges, poll responses, and access tokens follow the same format, enabling credential-source-agnostic identity.

**When to use:** Event gating, community membership, anonymous polls, composable credential ecosystems, sybil-resistant access control.
**Limitations:** Community-driven tooling; less mature than institutional-grade systems.

### F. Issuer-Independent Enrollment via Distributed OPRF

**Use Case:** [Resilient Identity Continuity](../use-cases/resilient-identity-continuity.md)
**Primary Pattern:** [Private MTP Authentication](../patterns/pattern-private-mtp-auth.md)
**Supporting Patterns:** [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md)

Issuer-hostile model: issuer may be unavailable, hostile, or destroyed. Plurality is the default, so any A-E source can enroll and no single issuer is load-bearing. Holders prove identity ownership to a threshold vOPRF network ([RFC 9497](https://www.rfc-editor.org/rfc/rfc9497) + [Jarecki](https://eprint.iacr.org/2017/363)), yielding a deterministic enrollment nullifier and a [Poseidon](https://www.poseidon-hash.info/) leaf in an on-chain [LeanIMT](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/lean-imt). Post-enrollment, the root is the sole trust anchor; no issuer contact during verification. [TACEO](https://core.taceo.io/articles/taceo-oprf/) operates a 13-node threshold vOPRF in production.

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
| Economic | Refundable stake (0.1 ETH default) | N sybils require N × stake locked | Attacker capital is finite |
| Social (future) | Web-of-trust vouching (K=3 vouches, V=2 lifetime budget) | Linear (not exponential) sybil growth | Social graph not fully captured by attacker |

When sources are honest, the cryptographic layer enforces one-to-one binding. When compromised, the economic layer bounds sybil creation to capital.

**Recovery:** Threshold (Shamir) secret splitting across devices/custodians (t-of-n, no on-chain tx). [Social recovery](../patterns/pattern-social-recovery.md) (guardian-based quorum) authorizes key rotation under the same enrollment; anti-coercion mechanism is an open question.

**Verification:** Any verifier checks a ZK proof against the on-chain root. Public inputs: root, scope-bound nullifier, predicate parameters. No registry lookup, no issuer contact.

**When to use:** Issuer may become unavailable, hostile, or destroyed. Sanctions compliance across jurisdictional disruptions. Multi-source enrollment with issuer-free verification.
**Deployment:** [Resilient Private Identity PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity) (Noir/UltraHonk, BN254)
**Limitations:** Requires distributed OPRF network (liveness depends on threshold availability). OPRF operators accumulate enrollment metadata (mitigated by anonymous communication). Recovery adds coordination overhead. Predicate parameters are public PoC inputs (production: private predicate circuits).

**Alternative strategies:** Distributed re-issuance (threshold committee produces credentials; limitation: committee sees content, bootstrapping post-failure is open). TEE-based credential vault (survives issuer destruction; limitation: manufacturer trust, side-channel risk; see [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)).

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

- One credential source + use case (e.g., Merkle membership for institutional KYC)
- Registry/attestation contracts with wallet/mobile proof generation

**Phase 2: Multi-Credential & Cross-Domain**

- Multiple credential sources in one system (e.g., KYC attestation + passport proof)
- Cross-institutional registry coordination, EAS audit trails

**Phase 3: Issuer-Independent Enrollment**

- Distributed OPRF enrollment with threshold MPC
- On-chain Merkle root as sole trust anchor, refundable stake sybil gate
- Additional enrollment paths (Anon Aadhaar, zkEmail, TLSNotary)
- Shamir + guardian recovery (anti-coercion mechanism TBD)

**Phase 4: Ecosystem Integration & Hardening**

- Cross-chain support, credential composability, L2 deployment
- Relayer infrastructure (EIP-4337 paymaster or purpose-built relay)
- Private predicate circuits, BLS12-381 migration (EIP-2537)

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

### Open Questions

1. **Multi-Address Efficiency:** Proving ownership of multiple EOAs from the same seed without revealing derivation patterns?
2. **Regulatory Recognition:** Legal recognition of ZK proofs as sufficient compliance evidence?
3. **Notary Trust:** How to guarantee Notary trustworthiness in zk-TLS deployments?
4. **Cross-Credential Composability:** Combining proofs from heterogeneous sources (passport + KYC attestation + community) in a single verification?
5. **Credential Revocation:** Revocation across heterogeneous issuers without a central authority?
6. **Guardian Recovery Design:** Minimum guardian set for anti-coercion? Acceptable coordination overhead for quorum recovery?
7. **Attribute Freshness:** Without an issuer to refresh, how are stale attributes (expired passports, changed nationality) handled?

### Alternative Approaches Considered

| Approach | Trade-off | Status |
| --- | --- | --- |
| **TEE-Based Authentication** ([pattern](../patterns/pattern-tee-based-privacy.md)) | Hardware trust + vendor lock-in vs. simplified proof generation | Production |
| **Federated Identity (OAuth/OIDC)** | Operational simplicity vs. privacy leakage + centralized dependency | Legacy |
| **DID/VC without ZK** (Microsoft ION, Spruce) | Simpler UX but reveals credential content to verifier | Production |
| **Semaphore (commitment only)** | Large anonymity sets but no identity-layer sybil resistance | Production |
| **World ID (biometric OPRF)** | Strongest one-person-one-identity vs. specialized hardware, centralized enrollment | Pilot (25M+) |
| **PLUME (ECDSA nullifiers, ERC-7524)** | Reuses existing keys vs. no attribute predicates | PoC |
| **OpenAC** ([paper](https://eprint.iacr.org/2026/251)) | Standards-compatible, no trusted setup vs. cooperative issuer required | PoC (moving to pilot) |

## Example Scenarios

### Scenario 1: Tokenized Security Access

- Client generates Semaphore proof of KYC registry membership
- Contract verifies proof and allows bond token transfer
- Observer sees transaction but cannot link to specific client

### Scenario 2: Multi-Institution Portfolio

- Client proves compliance to multiple banks/asset managers without revealing cross-institutional relationships
- Regulators audit each registry independently via selective disclosure

### Scenario 3: Anonymous Governance Vote

- Members prove token-holder status via Merkle membership
- MACI-style encrypted submission prevents vote buying; ZK tallying reveals result without individual votes

### Scenario 4: Sanctions Compliance Without Full KYC

- Participants use ZKPassport to prove passport validity and non-sanctioned status (OFAC/EU/UK) without revealing name or nationality
- Proof verified on-chain; no personal data collected

### Scenario 5: Issuer-Hostile (Sanctions, Shutdown, Recovery)

- Institution in sanctioned jurisdiction loses KYC providers; pre-enrolled employees continue proving attributes against on-chain root, no issuer contact
- KYC provider shuts down; new enrollees use self-contained sources (passport NFC, email DKIM) via OPRF network; verifiers see no disruption
- Holder loses device; reconstructs secret from Shamir shares or guardian quorum; original enrollment preserved

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-734/735](https://eips.ethereum.org/EIPS/eip-734), [EAS](https://attest.org/), W3C Verifiable Credentials, [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564), [RFC 9497 (OPRF)](https://www.rfc-editor.org/rfc/rfc9497), [RFC 9380 (hashToCurve)](https://www.rfc-editor.org/rfc/rfc9380), [EIP-196](https://eips.ethereum.org/EIPS/eip-196), [EIP-197](https://eips.ethereum.org/EIPS/eip-197)
- **ZK Frameworks:** [Semaphore](https://github.com/semaphore-protocol), [Noir/Barretenberg](https://docs.aztec.network/), [Circom/Groth16](https://docs.circom.io/), [Iden3](https://github.com/iden3)
- **Credential Systems:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Rarimo](https://rarimo.com/), [Anon Aadhaar](https://github.com/anon-aadhaar), [zkEmail](https://prove.email/), [TLSNotary](https://tlsnotary.org/), [POD2](https://github.com/0xPARC/pod2), [OpenAC](https://eprint.iacr.org/2026/251), [Human Passport](https://passport.human.tech/), [Holonym](https://holonym.id/)
- **Validated Deployments:** ZKPassport Aztec sale (120+ countries), Anon Aadhaar, World ID (25M registrations), [OpenCerts](https://www.opencerts.io/) (2M+ certs)
- **Related Patterns:** [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [ZK-KYC/ML + ONCHAINID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md), [zk-TLS](../patterns/pattern-zk-tls.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [co-SNARK](../patterns/pattern-co-snark.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Stealth Addresses](../patterns/pattern-stealth-addresses.md), [ERC-3643 RWA](../patterns/pattern-erc3643-rwa.md), [Compliance Monitoring](../patterns/pattern-compliance-monitoring.md), [Network Anonymity](../patterns/pattern-network-anonymity.md), [Noir Private Contracts](../patterns/pattern-noir-private-contracts.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md), [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md)
- **Prior Art:** [Vitalik zk-identity framework](https://vitalik.eth.limo/general/2025/06/28/zkid.html), [Human](https://human.tech/) (plural-identity scoring), [zk-creds (Rosenberg et al., 2023)](https://eprint.iacr.org/2022/878), [zk-promises (Shih et al., 2025)](https://eprint.iacr.org/2024/1260), [PLUME (Aayush Gupta, ERC-7524)](https://aayushg.com/thesis.pdf)
- **PoC:** [Resilient Private Identity](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-identity/resilient-private-identity)
- **Vendors:** [Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md), [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [TACEO](../vendors/taceo-merces.md), [Privacy Pools](../vendors/privacypools.md), [Chainlink ACE](../vendors/chainlink-ace.md), [EY](../vendors/ey.md)
- **Allies:** [ZKPassport](https://zkpassport.id/), [Self](https://self.xyz/), [Aztec](https://aztec.network/), [Anon Aadhaar](https://github.com/anon-aadhaar), [World ID](https://worldcoin.org/world-id), [Semaphore](https://semaphore.pse.dev/)

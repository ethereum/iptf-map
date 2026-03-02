# Approach: Private Authentication & Identity Verification

**Use Case Link:** [Private Authentication & Identity Verification](../use-cases/private-auth.md)

**High-level goal:** Enable any party (institutions, governments, DAOs) to verify identity claims on Ethereum without exposing the underlying identity, using verification logic that is publicly auditable and cryptographically enforced.

## Overview

### Problem Interaction

Private authentication addresses four interconnected challenges:

1. **Identity Verification Without Disclosure**: The fundamental problem across all domains. Proving "I am eligible" without revealing "I am Alice." Traditional authentication (message signatures) satisfies verifiers but exposes identities and creates trackable on-chain patterns.
2. **Credential Source Heterogeneity**: No single identity system covers all use cases. Passports, KYC registries, biometric enrollment, email ownership, event attendance, and on-chain history are all valid credential sources with different trust assumptions.
3. **Sybil Resistance**: Systems that distribute value (votes, tokens) need "one per person" guarantees without building identity databases. Requires deterministic, scope-bound nullifiers.
4. **Regulatory & Audit Compliance**: Financial use cases require selective disclosure and audit trails. All domains need scoped visibility without full identity exposure.

These problems interact because the same cryptographic primitives (membership proofs, nullifiers, selective disclosure) serve all four challenges across different domains.

### Key Constraints

**Universal:**

- Must not require a single canonical identity provider or central registry
- Must support credential revocation without re-identifying holders
- Proof generation must be practical on consumer hardware

**Financial (additional):**

- Must satisfy institutional KYC/AML compliance requirements
- Must provide regulatory audit trails with selective disclosure

**Governance (additional):**

- Must resist coercion
- Must scale to large anonymity sets without centralized bottlenecks

### TLDR for Different Personas

- **Business:** Verify eligibility claims (KYC status, citizenship, community membership) without exposing personal data. The same primitives serve financial compliance and governance.
- **Technical:** Organize by credential source: Merkle tree membership for registries, document ZK for government IDs, DKIM for email, TLS proofs for web2 data. Each has different trust assumptions and proof costs.
- **Legal:** Achieve regulatory compliance through verifiable proofs rather than data collection. Selective disclosure provides cryptographically scoped visibility.

## Architecture and Design Choices

### Approaches by Credential Source

| Approach | Credential Source | Trust Assumption | Proof Cost | Maturity | Key Deployment |
| --- | --- | --- | --- | --- | --- |
| [Merkle tree membership](#a-registry-based-membership-proofs) | Institutional registry | Registry operator | Low | Pilot | Semaphore, ERC-3643 |
| [Document ZK](#b-document-zk-proofs) | Government ID (NFC/signature) | Document issuer | Medium | Pilot | ZKPassport, Anon Aadhaar |
| [zk-TLS](#c-tls-transcript-proofs) | Web2 data source | Notary + TLS server | Medium | PoC | TLSNotary |
| [On-chain attestation](#d-on-chain-attestation) | Trusted issuer | Issuer signing key | Low | Production | EAS, ONCHAINID |
| [Anti-collusion voting](#e-anti-collusion-voting) | Encrypted vote + ZK tally | Coordinator (decentralizing) | Medium | Pilot | MACI / ETHDam |
| [PCD framework](#f-pcd-proof-carrying-data) | Event/community | Attestation issuer | Low | Pilot | Zupass / Devcon |
| DKIM proofs (email) | Email provider | Email provider DKIM key | Low | Pilot | zkEmail / Arbitrum |
| Biometric enrollment | Enrollment operator | Enrollment device | High (enrollment) | Pilot | World ID (25M users) |

---

### A. Registry-Based Membership Proofs

**Primary Pattern:** [Private MTP Authentication](../patterns/pattern-private-mtp-auth.md)
**Supporting Patterns:** [ZK-KYC/ML + ONCHAINID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md)

A registry operator (institution, DAO) maintains a Merkle tree of approved members. Provers generate ZK membership proofs demonstrating inclusion in the tree and exclusion from a revocation tree, without revealing which leaf they correspond to. [Semaphore](https://semaphore.pse.dev/) is the most established implementation, using identity commitments as leaves and nullifiers to prevent proof reuse.

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

**Anon Aadhaar** generates ZK proofs of Indian national ID (Aadhaar) attributes. It verifies UIDAI's DKIM signature client-side without sending data to any server. EVM-verifiable on-chain.

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

**When to use:** Permissioned token compliance (ERC-3643), cross-institutional credential sharing, regulatory registry mirroring (e.g., [eWpG bridge](../patterns/pattern-crypto-registry-bridge-ewpg-eas.md)).
**Deployment:** EAS is production-grade across multiple chains.
**Limitations:** Issuer linkage: the issuer knows which attestations they signed, creating a linkability vector unless combined with ZK membership proofs over the attestation set.

### E. Anti-Collusion Voting

[MACI](https://maci.pse.dev/) (Minimal Anti-Collusion Infrastructure) combines encrypted vote submission with ZK tallying. Voters submit encrypted votes; a coordinator decrypts and tallies them, then publishes a ZK proof that the tally is correct. Voters cannot prove how they voted to a third party, preventing vote buying and coercion.

**When to use:** DAO governance, grant allocation, any voting scenario where bribery or coercion resistance matters.
**Deployment:** ETHDam, ETHMexico, ETH Tegucigalpa. Aragon integration. Currently relies on a trusted coordinator; threshold encryption decentralization is in progress.
**Limitations:** Coordinator trust (being decentralized via threshold encryption); not a general-purpose authentication primitive, specialized for voting.

### F. PCD (Proof-Carrying Data)

[Zupass](https://zupass.org/) implements the Proof-Carrying Data framework: any piece of data can be bundled with a cryptographic proof of its own correctness. PCDs are composable: event tickets, community badges, poll responses, and access tokens all follow the same format. Identity is Semaphore-based, but the framework is credential-source-agnostic.

**When to use:** Event gating, community membership, anonymous polls, composable credential ecosystems, sybil-resistant access control.
**Deployment:** Zuzalu community (2023), Devcon (NFC-based PCD stamp distribution), various [0xPARC](https://0xparc.org/) events.
**Limitations:** Community-driven tooling; less mature than institutional-grade systems; requires Zupass client adoption.

---

### Vendor Recommendations

| Category | Vendors / Frameworks | Status |
| --- | --- | --- |
| Merkle membership | [Semaphore](https://semaphore.pse.dev/) (PSE), [Iden3](https://github.com/iden3) | Pilot |
| Document ZK | [ZKPassport](https://zkpassport.id/) (Noir/Barretenberg), [Anon Aadhaar](https://github.com/anon-aadhaar) (Circom) | Pilot/PoC |
| TLS proofs | [TLSNotary](https://tlsnotary.org/) | PoC |
| On-chain attestation | [EAS](https://attest.org/), [ONCHAINID](https://www.erc3643.org/) (Tokeny), W3C VC | Production |
| Anti-collusion voting | [MACI](https://maci.pse.dev/) (PSE) | Pilot |
| PCD framework | [Zupass](https://zupass.org/) (0xPARC) | Pilot |
| Email ZK | [zkEmail](https://prove.email/) | Pilot |

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

**Phase 3: Ecosystem Integration**

- Cross-chain authentication support
- Credential composability (combine proofs from different sources in a single verification)
- Standardized credential formats across domains

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
| PCD | High (Semaphore-based) | Attestation issuer | Low | Community adoption |

**ZK Membership vs Traditional Whitelists:**

- **ZK Benefits:** Complete privacy preservation, no address linkability, censorship-resistant verification
- **Traditional Benefits:** Simpler implementation, lower computational costs, no proof generation UX
- **Recommendation:** ZK for privacy-critical applications, traditional for internal operations

**On-Chain vs Off-Chain Verification:**

- **On-Chain:** Immediate verification, composability with smart contracts, higher costs
- **Off-Chain:** Lower costs, more flexible verification logic, requires trusted verifier
- **Hybrid:** Off-chain proof generation, on-chain verification for critical operations

**Single vs Multi-Address Proofs:**

- **Single Address:** Simpler proofs, established patterns
- **Multi-Address:** Complex proof construction, higher proof cost, better privacy for portfolio management
- **Progressive:** Start with single, upgrade to multi-address as technology matures

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

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-734/735](https://eips.ethereum.org/EIPS/eip-734), [EAS](https://attest.org/), W3C Verifiable Credentials, [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564)
- **ZK Frameworks:** [Semaphore](https://github.com/semaphore-protocol), [Noir/Barretenberg](https://docs.aztec.network/), [Circom/Groth16](https://docs.circom.io/), [Iden3](https://github.com/iden3)
- **Credential Systems:** [ZKPassport](https://zkpassport.id/), [Anon Aadhaar](https://github.com/anon-aadhaar), [zkEmail](https://prove.email/), [TLSNotary](https://tlsnotary.org/), [Zupass](https://zupass.org/), [MACI](https://maci.pse.dev/)
- **Validated Deployments:** ZKPassport Aztec sale (120+ countries), Anon Aadhaar, MACI, Zupass (Zuzalu, Devcon), World ID (25M registrations), [OpenCerts](https://www.opencerts.io/) (2M+ certs)
- **Related Patterns:** [Private MTP Auth](../patterns/pattern-private-mtp-auth.md), [ZK-KYC/ML + ONCHAINID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md), [zk-TLS](../patterns/pattern-zk-tls.md), [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [co-SNARK](../patterns/pattern-co-snark.md), [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md), [vOPRF Nullifiers](../patterns/pattern-voprf-nullifiers.md), [Stealth Addresses](../patterns/pattern-stealth-addresses.md), [ERC-3643 RWA](../patterns/pattern-erc3643-rwa.md), [Compliance Monitoring](../patterns/pattern-compliance-monitoring.md), [Network Anonymity](../patterns/pattern-network-anonymity.md), [Noir Private Contracts](../patterns/pattern-noir-private-contracts.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md)
- **Vendors:** [Aztec](../vendors/aztec.md), [Miden](../vendors/miden.md), [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [TACEO](../vendors/taceo-merces.md), [Privacy Pools](../vendors/privacypools.md), [Chainlink ACE](../vendors/chainlink-ace.md), [EY](../vendors/ey.md)

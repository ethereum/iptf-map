# Approach: Private Authentication & Identity Verification

**Use Case Link:** [Private Authentication & Interaction of Client EOAs](../use-cases/private-auth.md)

**High-level goal:** Enable institutions to verify valid client identity and EOA ownership while protecting client privacy, preventing address linkability, and maintaining regulatory compliance.

## Overview

### Problem Interaction

Private authentication addresses three interconnected challenges:

1. **Regulatory Compliance**: Institutions must verify valid client KYC/AML status and address ownership for regulatory requirements
2. **Privacy Protection**: Clients need to protect their identity and prevent linkability between their various addresses and institutional relationships

These problems interact because traditional authentication methods (message signatures, satoshi test) satisfy compliance but expose sensitive client information and create trackable on-chain patterns. The solution requires cryptographic techniques that enable verifiable compliance without identity disclosure.

### Key Constraints

- Must satisfy institutional KYC/AML compliance requirements
- Must support and check identity revocation
- Prevent linking multiple addresses belonging to the same client
- Support self-custody while enabling institutional verification
- Provide regulatory audit capabilities without compromising privacy
- Scale to handle frequent authentication across multiple institutions

### TLDR for Different Personas

- **Business:** Verify client compliance and address ownership without exposing client identities or creating trackable patterns
- **Technical:** Use ZK proofs and Merkle tree membership to prove inclusion in KYC registries and exclusoion from revoked list without revealing which specific client
- **Legal:** Maintain regulatory compliance through verifiable proofs while protecting client privacy rights

## Architecture and Design Choices

### Recommended Architecture: ZK-Based Registry Membership

**Primary Pattern:** [Private MTP Authentication](../patterns/pattern-private-mtp-auth.md)
**Supporting Patterns:**

- [ZK-KYC/ML + ONCHAINID](../patterns/pattern-zk-kyc-ml-id-erc734-735.md)
- [zk-TLS](../patterns/pattern-zk-tls.md)
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- [Co-SNARK](../patterns/pattern-co-snark.md)

#### Core Components:

1. **KYC Registry Infrastructure**

   - Off-chain KYC verification and client onboarding
   - Merkle tree construction with approved client addresses
   - Lean Incremental Merkle tree for revoked client addresses
   - On-chain root commitment with regular updates
   - Multi-institutional registry coordination

2. **ZK Proof System**

   - [Semaphore](https://semaphore.pse.dev/)-style membership proofs for registry inclusion
   - Nullifier system or verifier challenge system to prevent proof reuse and replay attacks
   - Private key ownership verification within the proof
   - Support for multi-address ownership proofs (same seed, different EOAs)

3. **Institution Integration Layer**

   - Contract hooks for proof verification before transactions
   - ERC-3643 integration for permissioned token transfers
   - [Attestation logging](../patterns/pattern-verifiable-attestation.md) for compliance trails
   - Cross-chain registry synchronization

4. **Regulatory Compliance Infrastructure**
   - Audit trails of registry updates and proof verifications
   - Selective disclosure for regulatory investigations
   - Threshold-based access controls for compliance officers
   - Standardized reporting formats across jurisdictions

### Vendor Recommendations

**Primary Infrastructure:**

- **ZK Frameworks:** Semaphore for membership proofs and exclusion proofs, Aztec Noir for custom circuits
- **Registry Management:** [Attestation infrastructure](../patterns/pattern-verifiable-attestation.md) (EAS, W3C VC, ONCHAINID), custom Merkle tree contracts
- **Identity Standards:** ERC-3643 for permissioned tokens, ERC-734/735 for identity claims

**Alternative Approaches:**

- **ZK TLS:** [zk-TLS](../patterns/pattern-zk-tls.md) for KYC data portability from web2
- **MPC-based:** [Co-SNARK](../patterns/pattern-co-snark.md) for multi-party KYC verification
- **FHE Integration:** [Zama](../vendors/zama.md) for homomorphic identity verification
- **Privacy L2:** Aztec Network for native privacy-preserving authentication

### Implementation Strategy

**Phase 1: Basic ZK Authentication**

- Deploy Merkle tree registry contracts on Ethereum L1/L2
- Implement zk-TLS for data portability or Semaphore-style membership and LeanIMT exclusion proofs
- Basic wallet integration for proof generation
- Single-institution pilot deployment

**Phase 2: Multi-Institution & Compliance**

- Cross-institutional registry coordination
- EAS integration for compliance logging
- Regulatory audit trail infrastructure
- Multi-address ownership proof support

**Phase 3: Advanced Features & Scaling**

- Cross-chain authentication support
- Machine learning-based KYC proof integration
- Full ecosystem integration

## More Details

### Trade-offs

**ZK Membership vs Traditional Whitelists:**

- **ZK Benefits:** Complete privacy preservation, no address linkability, regulatory compliance
- **Traditional Benefits:** Simpler implementation, lower computational costs
- **Recommendation:** ZK for privacy-critical applications, traditional for internal operations

**On-Chain vs Off-Chain Verification:**

- **On-Chain:** Immediate verification, composability with smart contracts, higher costs
- **Off-Chain:** Lower costs, more flexible verification logic, requires trusted verification
- **Hybrid:** Off-chain proof generation, on-chain verification for critical operations

**Single vs Multi-Address Proofs:**

- **Single Address:** Simpler proofs, established Semaphore patterns
- **Multi-Address:** Complex proof construction, proof cost high, better privacy for portfolio management
- **Progressive:** Start with single, upgrade to multi-address as technology matures

### Open Questions

1. **Multi-Address Efficiency:** How to efficiently prove ownership of multiple EOAs derived from the same seed without revealing derivation patterns?

2. **Cross-Institution Standards:** Standardization of KYC registry formats and proof verification across different institutions?

3. **Regulatory Recognition:** Legal recognition of ZK proofs as sufficient evidence for compliance purposes?

4. **Scalability:** Handling frequent registry updates and proof verification at institutional scale?

5. **Key Recovery:** Institutional-grade key management for clients while maintaining self-custody principles?

6. **Trust assumption on Notary** How to guarantee Notary trustworthiness?

### Alternative Approaches Considered

<!-- **Threshold Signatures**

- Use case: Multi-party control of authentication without full ZK overhead
- Trade-off: Simpler cryptography vs reduced privacy guarantees
- Status: Complementary technology for key management -->

**TEE-Based Authentication**

- Use case: Hardware-backed identity verification
- Trade-off: Hardware dependencies vs simplified proof generation
- Pattern: Secure enclave verification with attestation

**Federated Identity Systems**

- Use case: Cross-institutional identity sharing
- Trade-off: Operational simplicity vs privacy leakage
- Status: Legacy approach being superseded by ZK methods

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
- Regulators can audit each registry independently

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-734/735](https://eips.ethereum.org/EIPS/eip-734), [EAS](https://attest.org/)
- **ZK Infrastructure:** [Aztec Noir](https://docs.aztec.network/), [Sempahore ZK Protocol](https://github.com/semaphore-protocol), [Iden3](https://github.com/iden3)

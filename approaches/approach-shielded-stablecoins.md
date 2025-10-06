# Approach: Private Stablecoin Payments via Shielding

**Use Case Link:** [Private Stablecoins](../use-cases/private-stablecoins.md)

**High-level goal:** Enable confidential stablecoin transfers using shielded pool technology to hide transaction amounts, counterparties, and patterns while maintaining L1 security and regulatory auditability.

## Overview

### Problem Interaction

Shielded stablecoin approaches balance three core requirements:

1. **Privacy Preservation**: Hide sensitive financial information from competitors and unauthorized observers
2. **Maximum Security**: Leverage Ethereum L1's battle-tested consensus and finality for high-value institutional transfers
3. **Regulatory Transparency**: Provide selective disclosure capabilities for compliance and oversight

The interaction challenge is that L1 shielding requires more complex cryptographic operations (higher costs) but provides maximum security, while maintaining regulatory compliance without compromising the privacy benefits.

### Key Constraints

- Must work with existing stablecoin infrastructure (USDC, EURC)
- Integration with existing custodial and compliance systems
- Selective disclosure must meet varying regulatory requirements across jurisdictions
- Composability with DeFi protocols and atomic settlement mechanisms

### TLDR for Different Personas

- **Business:** Execute private treasury operations on ehtereum L1 with maximum security while maintaining regulatory compliance
- **Technical:** Wrap existing stablecoins in shielded pools with ZK proofs for privacy and selective disclosure
- **Legal:** Controlled access mechanisms provide regulatory oversight without exposing sensitive commercial information

## Architecture and Design Choices

### Recommended Architecture: L1 Shielded Pool with Selective Disclosure

**Primary Pattern:** [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md)
**Supporting Patterns:**

- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [ERC-7573 DvP](../patterns/pattern-dvp-erc7573.md)
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- [Stealth Addresses](../patterns/pattern-stealth-adresses.md)

#### Core Components:

1. **Shielded Pool Infrastructure**

   - Commitment/nullifier scheme for balance privacy
   - ZK proof system for transfer validation
   - Multi-denomination support (USDC, EURC, other stablecoins)
   - Gas optimization for institutional transaction volumes

2. **Stablecoin Integration Layer**

   - Deposit/withdrawal mechanisms for major stablecoins
   - Reserve management and audit capabilities
   - Integration with issuer compliance requirements
   - Cross-stablecoin atomic swaps within pool

3. **Selective Disclosure System**

   - Viewing key management for regulatory access
   - Threshold-based disclosure controls
   - EAS attestation logging for audit trails
   - Time-bounded and scope-limited access

4. **Atomic Settlement Integration**

   - ERC-7573 compatibility for DvP/PvP operations
   - Cross-domain settlement coordination
   - Integration with traditional payment rails

### Vendor Recommendations

**Primary Infrastructure:**

- **Shielded Pools:** Railgun for mature L1 implementation, Privacy Pools for improved compliance
- **ZK Infrastructure:** Circom/Groth16 (Railgun-style), Aztec Noir, Halo2/PLONK, or other proving systems depending on implementation
- **Stablecoin Partners:** Circle USDC, upcoming EURC integration

**Alternative Approaches:**

- **Hybrid L1/L2:** Bridge shielded L1 pools with privacy L2 for cost optimization, see [Private L2 Stablecoins](../approaches/approach-private-l2-stablecoins.md)
- **FHE Integration:** [Zama](../vendors/zama.md) for homomorphic operations on shielded balances

### Implementation Strategy

**Phase 1: Basic Shielded USDC**

- Deploy shielded pool contracts on Ethereum L1
- USDC deposit/withdrawal with basic privacy
- Regulatory viewing key infrastructure

**Phase 2: Multi-Currency & Compliance**

- Multi-stablecoin support (EURC, others)
- Advanced selective disclosure mechanisms
- EAS integration for compliance logging

**Phase 3: DeFi Integration & Scaling**

- ERC-7573 atomic settlement integration
- L2 bridging for cost optimization

## More Details

### Trade-offs

**L1 Shielding vs Privacy L2:**

- **L1 Benefits:**
  - **Security**: Ethereum's full validator set secures funds (no additional trust assumptions)
  - **Finality**: Established finality guarantees for large institutional transfers
  - **Ecosystem**: Broader DeFi integration and liquidity access
- **L2 Benefits:** Lower costs, better UX for frequent transactions
- **Recommendation:** L1 for high-value/low-frequency institutional use, L2 bridge for operational efficiency

**ZK vs FHE for Shielding:**

- **ZK Approach:** Lower ongoing costs, mature tooling, proven at scale
- **FHE Approach:** More flexible computation, higher costs, emerging technology
- **Recommendation:** ZK for production deployment, FHE for advanced features

**Full vs Partial Shielding:**

- **Full Shielding:** Maximum privacy, higher complexity and costs
- **Partial Shielding:** Selective privacy features, better performance
- **Hybrid:** User-controlled privacy levels based on transaction sensitivity

### Open Questions

1. **Stablecoin Issuer Integration:** How to maintain compliance with issuer KYC/AML while enabling shielding?

2. **Cross-Stablecoin Privacy:** Unified shielding across different stablecoin types and issuers?

3. **Regulatory Standardization:** Common selective disclosure standards across jurisdictions?

4. **DeFi Composability:** Integration with existing DeFi protocols while maintaining privacy?

5. **Liquidity Management:** Market making and arbitrage in shielded environments?

### Alternative Approaches Considered

**Privacy Pools Enhancement**

- Use case: Improved compliance features over basic mixing
- Trade-off: Better regulatory acceptance vs reduced anonymity set
- Status: Active development with compliance-first design

**Cross-Chain Shielding**

- Use case: Multi-chain stablecoin privacy
- Trade-off: Broader utility vs increased complexity
- Pattern: [ZK HTLC](../patterns/pattern-zk-htlc.md) for conditional atomic transfers

**Threshold Shielding**

- Use case: Privacy only above certain transaction thresholds
- Trade-off: Reduced complexity vs limited privacy scope
- Consideration: Regulatory preference for large transaction monitoring

## Example Scenarios

### Scenario 1: Cross-Border Treasury Transfer

- Corporation moves $25M EURC between European subsidiaries
- Privacy: Transfer amount and internal corporate structure protected
- Integration: SWIFT message generation for traditional bank records
- Audit: Selective disclosure to multiple regulatory jurisdictions

## Links and Notes

- **Standards:** [ERC-20](https://eips.ethereum.org/EIPS/eip-20), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573), [ERC-5564](https://eips.ethereum.org/EIPS/eip-5564)
- **Infrastructure:** [Railgun](https://railgun.org/), [Privacy Pools](https://www.privacypools.com/), [EAS](https://attest.org/)
- **Research:** [Privacy Pool paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
- **Related Approaches:** [Private L2 Stablecoins](../approaches/approach-private-l2-stablecoins.md), [Private DvP](../approaches/approach-private-dvp.md)

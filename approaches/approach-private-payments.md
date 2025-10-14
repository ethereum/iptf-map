# Approach: Private Payments

**Use Case Link:** [Private Stablecoins](../use-cases/private-stablecoins.md)

**High-level goal:** Enable confidential payment transfers using stablecoins and other digital assets while hiding amounts, counterparties, and transaction patterns, with selective regulatory disclosure capabilities.

## Overview

### Problem Interaction

Private payment systems address three interconnected challenges:

1. **Operational Privacy**: Treasury operations, payment flows, and settlement patterns reveal competitive intelligence when visible on-chain
2. **Security vs Cost Trade-offs**: L1 provides maximum security but higher costs, while L2s offer efficiency but different trust assumptions
3. **Regulatory Compliance**: Financial institutions require auditability and selective disclosure capabilities across varying jurisdictions

These problems interact because traditional payment transparency conflicts with institutional confidentiality needs, while privacy solutions must maintain regulatory compliance and operational efficiency.

### Key Constraints

- Must work with existing stablecoin infrastructure (USDC, EURC, etc.)
- Integration with existing payment rails (SWIFT, ISO20022) and custodial systems
- Selective disclosure must meet varying regulatory requirements across jurisdictions
- Support for high-frequency institutional operations with predictable costs
- Composability with broader DeFi and settlement infrastructure

### TLDR for Different Personas

- **Business:** Execute private treasury operations with maximum security while maintaining regulatory compliance
- **Technical:** Implement privacy-preserving payment infrastructure using L1 shielding or privacy L2s with selective disclosure
- **Legal:** Maintain regulatory compliance through controlled access mechanisms and audit trails while protecting commercial confidentiality

## Architecture and Design Choices

### Two Primary Approaches

**L1 Shielded Payments:**

- Maximum security using Ethereum L1 consensus
- Provides **anonymity** (unlinkable addresses) but limited **privacy** (amounts/patterns may still leak)
- [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md) with commitment/nullifier schemes
- Higher per-transaction costs but battle-tested infrastructure

**Privacy L2 Payments:**

- Full **privacy** with hidden state and confidential transfers
- Lower costs and higher throughput for frequent operations
- [Private L2s](../patterns/pattern-privacy-l2s.md) with privacy-native stablecoin implementations
- Complete transaction confidentiality including amounts, counterparties, and patterns

### Recommended Architecture: Hybrid L1/L2 Model

**Primary Patterns:**

- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [Private ISO20022](../patterns/pattern-private-iso20022.md) for traditional rail integration
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)

#### Core Components:

1. **Multi-Tier Payment Infrastructure**

   - L1 Shielding: High-value transfers using shielded pools (Railgun-style commitment/nullifier)
   - Privacy L2: Frequent operations on privacy-native rollups (Aztec, Fhenix)
   - Cross-tier bridges: Secure movement between L1 and L2 privacy domains

2. **Selective Disclosure Layer**

   - Regulator viewing keys for scoped audit access
   - Time-bound, threshold-controlled disclosure mechanisms
   - EAS attestation logging for compliance trails
   - Encrypted audit logs with selective decryption

3. **Traditional Rail Integration**

   - ISO20022 message interpreters for SWIFT compatibility
   - Privacy-preserving bridges to traditional payment systems
   - Encrypted metadata for regulatory reporting

4. **Multi-Asset Support**

   - Support for multiple stablecoins (USDC, EURC, etc.)
   - Cross-currency private transfers and conversions
   - Integration with existing stablecoin compliance frameworks

### Vendor Recommendations

**Primary Infrastructure:**

- **L1 Shielding:** [Railgun](../vendors/railgun.md) for mature UTXO-style privacy pools
- **Privacy L2:** [Aztec Network](../vendors/aztec-l2.md) for native confidential transfers, [Fhenix](../vendors/fhenix.md) for FHE-based payments
- **Traditional Integration:** SWIFT network adapters, ISO20022 processors

**Alternative Approaches:**

- **FHE Approach:** [Zama](../vendors/zama.md) fhEVM for homomorphic stablecoin operations

### Implementation Strategy

**Phase 1: Core Payment Privacy**

- Deploy chosen privacy infrastructure (L1 shielding or privacy L2)
- Integrate major stablecoins (USDC, EURC)
- Basic selective disclosure mechanisms

**Phase 2: Regulatory & Compliance**

- Viewing key management infrastructure
- SWIFT/ISO20022 message integration
- Multi-jurisdiction compliance features

**Phase 3: Ecosystem Integration**

- Cross-tier bridging (L1 ↔ L2)
- Multi-currency private conversions
- Integration with broader settlement infrastructure
- Institutional custody and risk management system integration

## More Details

### Trade-offs

**L1 Shielding vs L2 Privacy:**

- **L1 Shielding:** Maximum security, anonymity focus, established infrastructure, higher costs
- **L2 Privacy:** Complete privacy (amounts + identities), lower costs, better UX for frequent payments
- **Recommendation:** L2 privacy for comprehensive institutional needs, L1 shielding for anonymity-focused use cases

**ZK vs FHE for Privacy:**

- **ZK Approach:** Lower operational costs, mature tooling, proven regulatory acceptance
- **FHE Approach:** More flexible computation, higher costs, emerging technology
- **Recommendation:** ZK for basic payments, FHE for complex payment logic

**Shielding vs Native Privacy:**

- **Shielding:** Works with existing stablecoins, established patterns
- **Native Privacy:** Better performance, requires new stablecoin deployments
- **Hybrid:** Use both based on operational needs

### Open Questions

1. **Stablecoin Issuer Integration:** How to maintain compliance with issuer KYC/AML while enabling payment shielding?

2. **Cross-Jurisdiction Standards:** Standardization of selective disclosure formats across different regulatory regimes?

3. **Traditional Rail Integration:** Technical standards for SWIFT/ISO20022 integration with privacy infrastructure?

4. **Liquidity Fragmentation:** Impact of privacy requirements on stablecoin liquidity and market making?

5. **Operational Recovery:** Key recovery and business continuity for institutional payment operations?

### Alternative Approaches Considered

**Mixing Services**

- Use case: Simple payment privacy without institutional compliance
- Trade-off: Lower complexity vs reduced regulatory acceptance
- Consideration: Regulatory compliance challenges

## Example Scenarios

### Corporate Treasury Operations

- Multinational corporation needs daily operational payments ($1-5M) between subsidiaries
- Privacy: Payment amounts and corporate cash flow patterns confidential
- Compliance: Tax reporting and transfer pricing documentation
- Implementation: Privacy L2 for frequent transfers with periodic L1 settlement

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573), [ISO 20022](https://www.iso20022.org/), [ERC-20](https://ercs.ethereum.org/ERCS/erc-20)
- **Infrastructure:** [Railgun](https://railgun.org/), [Aztec Network](https://docs.aztec.network/), [Zama fhEVM](https://docs.zama.ai/fhevm)
- **Regulatory:** [MiCA Framework](../jurisdictions/eu-MiCA.md), [SEC - GENIUS Act](../jurisdictions/us-SEC.md)
- **Related Approaches:** [Private Trade Settlement](../approaches/approach-private-trade-settlement.md), [Private Derivatives](../approaches/approach-private-derivatives.md)

# Approach: Private Stablecoin Payments on Privacy L2s

**Use Case Link:** [Private Stablecoins](../use-cases/private-stablecoins.md)

**High-level goal:** Enable confidential stablecoin transfers between institutions while hiding amounts, counterparties, and transaction patterns, with selective regulatory disclosure capabilities.

## Overview

### Problem Interaction

Institutional stablecoin usage faces two core challenges:

1. **Operational Privacy**: Treasury operations, margin movements, and settlement flows reveal competitive intelligence when visible on-chain
2. **Regulatory Compliance**: Financial institutions require auditability and selective disclosure capabilities for oversight

These problems interact because traditional privacy solutions may conflict with regulatory requirements for transaction monitoring and reporting. The solution requires privacy-preserving infrastructure that enables selective disclosure without compromising confidentiality.

### Key Constraints

- Must preserve stablecoin programmability and composability
- Integration with existing payment rails (SWIFT, ISO20022)
- Regulatory oversight requiring audit trails and selective disclosure
- Cross-border compliance with varying privacy regulations
- High-frequency transaction support for institutional operations

### TLDR for Different Personas

- **Business:** Execute confidential treasury operations and settlements without revealing trading strategies or cash positions
- **Technical:** Deploy privacy-native stablecoin infrastructure on L2s with selective disclosure mechanisms
- **Legal:** Maintains regulatory compliance through controlled access and audit trails while protecting operational confidentiality

## Architecture and Design Choices

### Recommended Architecture: Privacy-Native Stablecoin L2

**Primary Pattern:** [Private L2s](../patterns/pattern-privacy-l2s.md)
**Supporting Patterns:**

- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md)
- [Private ISO20022](../patterns/pattern-private-iso20022.md)
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)

#### Core Components:

1. **Privacy-Native Stablecoin Infrastructure**

   - Confidential ERC-20 implementations on privacy L2
   - Native support for encrypted balances and transfers
   - Multi-currency support (USDC, EURC, JPY, etc.)

2. **Cross-Chain Bridge & Settlement**

   - Secure bridging between L1 stablecoin reserves and L2 privacy
   - Support for traditional payment rail integration (SWIFT)

3. **Regulatory Compliance Infrastructure**

   - Selective disclosure mechanisms with viewing keys
   - EAS attestation logging for audit trails
   - Threshold-based regulator access controls
   - Automated compliance reporting workflows

4. **Traditional Finance Integration**
   - ISO20022 message interpreters for SWIFT compatibility
   - Custodial system integration APIs
   - Off-chain accounting framework bridges

### Vendor Recommendations

**Primary Infrastructure:**

- **Privacy L2:** Aztec Network for confidential asset support
- **Stablecoin Issuers:** Circle USDC with privacy L2 bridge, upcoming EURC
- **Compliance:** EAS for attestation infrastructure

**Alternative/Emerging:**

- **FHE Approach:** [Zama](../vendors/zama.md) fhEVM for homomorphic stablecoin operations

### Implementation Strategy

**Phase 1: Basic Private Transfers**

- Deploy confidential USDC on chosen privacy L2
- Implement basic shielded transfer functionality
- Selective disclosure infrastructure for regulators

**Phase 2: Cross-Border Integration**

- Multi-currency support (EURC, other CBDCs)
- SWIFT/ISO20022 message integration
- Cross-jurisdiction compliance frameworks

**Phase 3: Institutional Scale**

- High-frequency transaction optimization
- Traditional finance system integration

## More Details

### Trade-offs

**Privacy L2 vs L1 Shielded Pools:**

- **L2 Benefits:** Native privacy, lower costs, better UX for frequent transfers, not mature yet
- **L1 Benefits:** Maximum security, broader ecosystem compatibility
- **Recommendation:** Privacy L2 for operational efficiency when ready with L1 reserve backing

**Full Privacy vs Selective Transparency:**

- **Full Privacy:** Maximum confidentiality, may conflict with regulatory requirements
- **Selective Transparency:** Controlled disclosure, better regulatory alignment
- **Hybrid Approach:** Private by default with regulator-controlled transparency

**Native vs Wrapped Stablecoins:**

- **Native:** Built for privacy L2, optimal UX, requires issuer cooperation
- **Wrapped:** Bridge existing stablecoins, faster deployment, additional complexity
- **Recommendation:** Start with wrapped, migrate to native as ecosystem matures

### Open Questions

1. **Stablecoin Issuer Adoption:** Timeline for major issuers (Circle, Tether) to support privacy L2s natively?

2. **Cross-Jurisdictional Standards:** Harmonization of selective disclosure requirements across regions?

3. **Traditional Rail Integration:** Technical standards for SWIFT/ISO20022 integration with privacy L2s?

4. **Liquidity Provision:** Impact of privacy on market making and liquidity provision?

5. **Compliance Automation:** Automated regulatory reporting from privacy-preserving transaction data?

### Alternative Approaches Considered

**Mixing Services (Legacy)**

- Use case: Simple privacy without regulatory integration
- Trade-off: Compliance risks vs operational simplicity
- Status: Being superseded by privacy L2 approaches

**FHE-First Approach**

- Use case: Maximum programmability with encrypted computation
- Trade-off: Higher costs vs computational flexibility
- Pattern: Zama fhEVM confidential ERC-20

**TEE-Based Solutions**

- Use case: High-throughput with hardware privacy guarantees
- Trade-off: Hardware dependencies vs performance
- Pattern: [TEE + ZK Settlement](../patterns/pattern-tee-zk-settlement.md)

## Example Scenarios

### Scenario 1: Cross-Border Treasury Operations

- Multinational corporation moving $50M USDC between subsidiaries
- Privacy: Transfer amounts and timing hidden from competitors
- Compliance: Automated regulatory reporting to relevant jurisdictions
- Integration: SWIFT message generation for traditional bank notification

### Scenario 2: Margin Call Settlement

- Derivative counterparty transferring collateral for margin requirements
- Privacy: Margin amounts and risk exposure confidential
- Speed: Sub-hour settlement vs traditional T+2
- Auditability: Regulator can verify adequate collateralization via ZK proofs

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573), [ISO 20022](https://www.iso20022.org/), [ERC-20](https://ercs.ethereum.org/ERCS/erc-20)
- **Infrastructure:** [Aztec Network](https://docs.aztec.network/), [Circle USDC](https://www.circle.com/usdc)
- **Regulatory:** [MiCA Framework](../jurisdictions/eu-MiCA.md), [SEC - GENIUS Act](../jurisdictions/us-SEC.md)
- **Related Approaches:** [Private DvP](../approaches/approach-private-dvp.md), [Shielded Stablecoins](../approaches/approach-shielded-stablecoins.md)

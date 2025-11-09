# Approach: Private Bond Issuance & Trading

**Use Case Link:** [Private Bonds](../use-cases/private-bonds.md)

**High-level goal:** Enable institutional bond issuance and trading on public blockchains with confidential amounts, positions, and trade details while maintaining regulatory compliance, DvP settlement, and economically viable operations.

## Overview

### Problem Interaction

Private bond trading addresses three interconnected challenges:

1. **Market Protection**: Hide volumes, prices, and positions to prevent front-running and competitive intelligence gathering
2. **Regulatory Compliance**: Provide selective disclosure capabilities for eWpG/MiCA compliance and crypto-registry integration
3. **Settlement Efficiency**: Ensure atomic delivery-versus-payment with predictable costs and daily settlement cycles

These problems interact because traditional bond trading requires transparent price discovery and settlement coordination, while institutional privacy needs conflict with public blockchain transparency. The solution requires privacy-preserving infrastructure that maintains market efficiency and regulatory oversight.

### Key Constraints

- Must comply with eWpG/MiCA regulations and crypto-registry requirements
- Atomic DvP settlement with minutes-level finality acceptable
- Daily settlement cycles with economically viable L2 costs
- Pre-trade privacy for RFQ processes and order flow
- Production timeline of 1-2 years with proven infrastructure
- Avoid HTLC brittleness in favor of ERC-7573 standards

### TLDR for Different Personas

- **Business:** Execute bond issuance and trading privately while maintaining regulatory compliance and market efficiency
- **Technical:** ERC-3643 tokenized securities with UTXO-style shielding for confidential transfers and ERC-7573 atomic settlement
- **Legal:** Maintain eWpG/MiCA compliance through selective disclosure while protecting proprietary trading information

## Architecture and Design Choices

### Recommended Architecture: ERC-3643 + Privacy Extensions

**Primary Pattern:** [ERC-3643 T-REX protocol](https://docs.erc3643.org/erc-3643) + [Shielded transfers](../patterns/pattern-shielding.md)
**Supporting Patterns:**

- [Private L2s](../patterns/pattern-privacy-l2s.md)
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [ICMA BDT Data Model](../patterns/pattern-icma-bdt-data-model.md)

#### Core Components:

1. **Bond Lifecycle Management**

   - ERC-3643 compliant tokenized securities with confidential transfers
   - ICMA Bond Data Taxonomy integration for standardized bond data
   - Private identity verification and eligibility management (can be relaxed for a first iteration)
   - Confidential issuance parameters and secondary trading

### Key Standard: ERC-3643 + Privacy Layer

ERC-3643 provides the regulatory compliance framework for tokenized securities, while privacy extensions enable confidential transfers:

- **Identity Layer:** ERC-3643's ONCHAINID system handles KYC/eligibility verification
- **Transfer Rules:** Compliance checks (investor accreditation, transfer restrictions) remain transparent
- **Privacy Layer:** Shielding applied to transfer amounts and holder balances
- **Selective Disclosure:** Regulators maintain oversight through viewing keys while protecting commercial data

This approach preserves the regulatory benefits of ERC-3643 while adding the privacy needed for institutional bond trading.

2. **Privacy Implementation Options**

   - **Option A (Recommended):** UTXO-style Shielded ERC-3643

     - Combines Railgun-style UTXO privacy model with ERC-3643 compliance framework
     - Maintains regulatory compliance while enabling confidential transfers
     - Proven cryptographic foundations with institutional regulatory acceptance

   - **Option B:** ERC-3643 on Privacy L2 with native confidential transfers
   - **Option C:** ERC-3643 + FHE for homomorphic bond calculations

3. **Atomic Settlement Infrastructure**

   - ERC-7573 integration for bond-vs-cash atomic settlement
   - Cross-chain compatibility for diverse stablecoin payment rails
   - Integration with crypto-registry for eWpG compliance
   - Automated settlement triggers and failure handling

4. **Regulatory Compliance Layer**
   - Selective disclosure mechanisms for regulator access
   - Crypto-registry integration for legal entity verification
   - [Attestation logging](../patterns/pattern-verifiable-attestation.md) for audit trails (EAS, W3C VC, or ONCHAINID)
   - Encrypted append-only audit logs with on-chain anchoring

### Vendor Recommendations

**Primary Infrastructure:**

- **Shielding Protocol:** [Railgun](../vendors/railgun.md) for UTXO-style privacy with ERC-3643 integration
- **Tokenized Securities:** ERC-3643 T-REX protocol for compliant bond tokenization
- **Settlement:** Native ERC-7573 implementations for atomic DvP coordination
- **Compliance:** [Chainlink ACE](../vendors/chainlink-ace.md) for regulatory compliance automation

**Alternative Privacy Approaches:**

- **Privacy L2:** [Aztec Network](../vendors/aztec-l2.md) for native private notes with ERC-3643 adaptation
- **FHE-First:** [Zama](../vendors/zama.md) fhEVM for homomorphic bond computation

### Implementation Strategy

**Phase 1: Private Bond Infrastructure**

- Deploy ERC-3643 tokenized securities with privacy extensions
- Integrate identity verification (ONCHAINID) and eligibility management
- Basic ICMA BDT integration for standardized bond data
- Single-currency settlement (USDC/EURC)

**Phase 2: Atomic Settlement & Compliance**

- ERC-7573 atomic DvP implementation
- Crypto-registry integration for eWpG compliance
- Selective disclosure infrastructure for regulators (shielding + view keys)
- Multi-currency settlement support

**Phase 3: Secondary Market & Scaling**

- Private RFQ and order book infrastructure
- Pre-trade privacy for institutional order flow
- Full ecosystem integration with existing bond infrastructure

## More Details

### Trade-offs

**UTXO Shielding vs Privacy L2:**

- **UTXO Benefits:** Proven security model, ERC-3643 compatibility, deplyable on L1/L2
- **Private L2 Benefits:** no shielding overhead, native privacy, better UX for frequent trading
- **Recommendation:** UTXO-style shielding (Railgun approach) for institutional adoption with established compliance, then private L2s when ready

**FHE vs ZK Privacy:**

- **FHE Approach:** Simpler programming model, higher ongoing costs, better for complex computations
- **ZK Approach:** Lower operational costs, mature tooling, proven regulatory acceptance
- **Recommendation:** ZK-based UTXO shielding for core privacy, FHE for specialized bond calculations

**Full vs Selective Privacy:**

- **Full Privacy:** Maximum confidentiality, higher complexity and costs
- **Selective Privacy:** Targeted protection of sensitive data, better performance
- **Hybrid:** Public legal entities with private amounts/positions/terms (recommended for ERC-3643)

### Open Questions

1. **Secondary Market Structure:** How to implement private RFQ systems while maintaining price discovery efficiency?

2. **Pre-Trade Privacy:** What level of order flow privacy is required before execution vs post-trade confidentiality?

3. **Regulatory Standards:** Standardization of selective disclosure formats for eWpG/MiCA compliance across jurisdictions?

4. **Legacy Integration:** Bridging between on-chain privacy and traditional bond settlement systems (Euroclear, etc.)?

5. **Market Data:** How to provide market data and analytics while preserving transaction privacy?

### Alternative Approaches Considered

**L1 ZK Commitment Pool**

- Use case: Very low volume, maximum security requirements
- Trade-off: Higher per-transaction costs vs maximum security guarantees
- Pattern: [L1 ZK Commitment Pool](../patterns/pattern-l1-zk-commitment-pool.md)

## Example Scenarios

### Scenario 1: Corporate Bond Issuance

- Corporation issues €100M bond series with private allocation amounts
- Privacy: Investor allocations and pricing terms confidential
- Compliance: Crypto-registry verification and regulator disclosure
- Settlement: Atomic delivery of bond tokens vs EURC payment

### Scenario 2: Secondary Market Trading

- Asset manager trades €25M government bond position
- Privacy: Trade size, counterparty, and portfolio impact hidden
- RFQ Process: Private quote requests without revealing intended size
- Settlement: ERC-7573 atomic settlement with encrypted audit trail

## Links and Notes

- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573), [ICMA BDT](https://www.icmagroup.org/market-practice-and-regulatory-policy/repo-and-collateral-markets/legal-documentation/global-master-repurchase-agreement-gmra/)
- **Research:** [Private Tokenized Securities with UTXO Model](https://eprint.iacr.org/2025/1715.pdf) - UTXO-style privacy for ERC-3643 compliant securities
- **Regulations:** [eWpG](../jurisdictions/de-eWpG.md), [MiCA](../jurisdictions/eu-MiCA.md)
- **Infrastructure:** [Railgun](https://railgun.org/), [Aztec Network](https://docs.aztec.network/), [Zama fhEVM](https://docs.zama.ai/fhevm)
- **Related Approaches:** [Private DvP](../approaches/approach-private-dvp.md), [Private Derivatives](../approaches/approach-private-derivatives.md)

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

- Must comply with different regulations and crypto-registry requirements
- Atomic DvP settlement with minutes-level finality acceptable
- Daily settlement cycles with economically viable L2 costs
- Pre-trade privacy for RFQ processes and order flow
- Production timeline of 1-2 years with proven infrastructure
- Same-chain atomic DvP achievable; cross-chain DvP requires trusted relayer or bridging

### TLDR for Different Personas

- **Business:** Execute bond issuance and trading privately while maintaining regulatory compliance and market efficiency
- **Technical:** UTXO-based shielded notes with zero-knowledge circuits for confidential transfers; atomic DvP on same chain
- **Legal:** Maintain compliance (e.g., eWpG/MiCA) through selective disclosure (viewing keys, attestations) while protecting proprietary trading information

## Architecture and Design Choices

### Fundamental Choice: UTXO vs Account Model

The core architectural decision for private bonds is the state model:

| Model                      | Privacy   | How it Works                                                                         | Compliance                           |
| -------------------------- | --------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| **Account-based (ERC-20)** | Bolted-on | Balances public by default; privacy added via encryption wrappers or shielding pools | Native (ERC-3643, transfer hooks)    |
| **UTXO-based (Notes)**     | Native    | Value stored as hidden commitments; only nullifiers revealed on spend                | Added via viewing keys, attestations |
| **Native Privacy L2**      | Native    | Private state at protocol level (e.g., Aztec notes)                                  | Added via compliance contracts       |

**Recommendation:** UTXO-based notes provide privacy by default, making them the preferred architecture for confidential bond issuance. Compliance can be layered on top via selective disclosure rather than retrofitted onto a transparent base.

### Recommended Architecture: UTXO Shielded Notes

**Primary Pattern:** [Shielding](../patterns/pattern-shielding.md) with zero-knowledge circuits
**Supporting Patterns:**

- [ZK Shielded Balances](../patterns/pattern-zk-shielded-balances.md)
- [Privacy L2s](../patterns/pattern-privacy-l2s.md)
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [ICMA BDT Data Model](../patterns/pattern-icma-bdt-data-model.md)

#### Core Components

1. **Note-Based Bond Representation**

   - Bonds represented as UTXO notes (commitments hiding amount + owner)
   - Transfers via JoinSplit: consume input notes (nullifiers) → produce output notes (commitments)
   - Merkle tree tracks valid note set; nullifier set prevents double-spend

2. **Identity Model**

   - **Transport Identity:** Public address for gas, on-chain authorization, KYC linkage
   - **Shielded Identity:** Spending key (ZK proofs) + Encryption key (private memos)
   - Issuer maintains mapping for regulatory disclosure

3. **Issuance & Redemption**

   - **Issuance:** Global Note → JoinSplit into individual holder notes
   - **Transfer:** JoinSplit circuits with encrypted memos to recipients
   - **Redemption:** Burn proof reveals value to issuer for settlement

4. **Atomic Settlement**
   - Same-chain atomic DvP for bond-vs-stablecoin settlement
   - Cross-chain settlement requires trusted relayer or bridge
   - Automated settlement triggers and failure handling

### Alternative Architectures

**Option A: Native Privacy L2 (Aztec)**

- Bonds as native Aztec private notes with protocol-level privacy
- No shielding implementation overhead — private notes is part of the execution model
- Compliance via Aztec's private contracts and selective disclosure
- Trade-off: Ecosystem maturity, liquidity fragmentation
- See: [Aztec Network](../vendors/aztec.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md)

**Option B: FHE-Based (Zama fhEVM)**

- Encrypted balances with homomorphic computation
- Trade-off: Higher compute costs, less mature tooling
- Benefit: Simpler programming model for complex bond logic
- See: [Zama](../vendors/zama.md)

### Compliance Layer (Optional Add-ons)

Regardless of architecture, compliance can be layered via:

- **Viewing Keys:** Grant auditors/regulators read access to specific notes
- **Attestations:** On-chain claims (EAS, ONCHAINID) linking shielded identity to KYC status
- **ERC-3643 Integration:** For jurisdictions requiring explicit transfer rules, wrap notes in compliant token interface
- **Crypto-Registry:** Legal entity verification for eWpG/MiCA compliance

## More Details

### Trade-offs

**UTXO Shielding vs Privacy L2:**

- **UTXO Benefits:** Proven security model, ERC-3643 compatibility, deployable on L1/L2
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
- Settlement: Same-chain atomic DvP with encrypted audit trail

## Links and Notes

- **Reference Implementation:** [Private Tokenised Bonds PoC](https://github.com/Meyanis95/private-tokenised-bonds) - UTXO shielded bond issuance with JoinSplit circuits
- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ICMA BDT](https://www.icmagroup.org/market-practice-and-regulatory-policy/repo-and-collateral-markets/legal-documentation/global-master-repurchase-agreement-gmra/)
- **Research:** [Private Tokenized Securities with UTXO Model](https://eprint.iacr.org/2025/1715.pdf) - UTXO-style privacy for ERC-3643 compliant securities
- **Regulations:** [eWpG](../jurisdictions/de-eWpG.md), [MiCA](../jurisdictions/eu-MiCA.md)
- **Infrastructure:** [Railgun](https://railgun.org/), [Aztec Network](https://docs.aztec.network/), [Zama fhEVM](https://docs.zama.ai/fhevm)
- **Related Approaches:** [Private DvP](../approaches/approach-private-dvp.md), [Private Derivatives](../approaches/approach-private-derivatives.md)

# Approach: Private Smart Derivatives

**Use Case Link:** [Private Derivatives](../use-cases/private-derivatives.md)

**High-level goal:** Enable ERC-6123 derivatives trading with confidential margin balances, settlement amounts, and trade terms while maintaining automation, auditability, and regulatory compliance.

## Overview

### Problem Interaction

The core challenge is balancing three competing requirements:

1. **Privacy**: Hide margin balances, deltas, and trade parameters from competitors
2. **Automation**: Maintain ERC-6123 semantics for programmatic risk management
3. **Auditability**: Provide regulatory oversight without compromising confidentiality

These problems interact because traditional privacy solutions (like simple encryption) break automation, while transparent automation exposes sensitive trading information. The solution requires cryptographic techniques that enable verifiable computation on private data.

### Key Constraints

- Must preserve ERC-6123 capped-deal behavior and margin enforcement
- Daily settlement cadence with atomic, single-transaction transfers
- Regulatory compliance requiring audit trails and threshold disclosure
- Integration with existing institutional tech stacks

### TLDR for Different Personas

- **Business:** Execute derivatives privately on public blockchains while competitors can't see your risk appetite or strategy, but regulators maintain oversight capabilities
- **Technical:** Use ZK proofs or FHE to compute settlement deltas on encrypted balances while preserving smart contract automation
- **Legal:** Maintains compliance through selective disclosure mechanisms and audit trails while protecting proprietary trading information

## Architecture and Design Choices

### Recommended Architecture: Hybrid ZK + Shielded Pool Approach

**Primary Pattern:** [ZK Shielded Balances for Derivatives](../patterns/pattern-zk-shielded-balances.md)
**Supporting Patterns:**

- [ZK Proof of Private State Transition](../patterns/pattern-zk-derivative-delta.md)
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)

#### Core Components:

1. **Shielded Balance Pool**

   - Margin deposits converted to commitments via shielding protocol (privacy L2, Railgun-style L1 pools, or regular L2 with shielding)
   - Nullifier-based double-spend prevention
   - Support for multiple collateral types (USDC, EURC, etc.)

2. **ZK State Transition Engine**

   - Daily oracle price inputs (public, signed)
   - ZK circuits proving: `delta = f(notional, price, direction, caps)`
   - Either counterparty can submit valid proofs (first wins)
   - Privacy-aware wrapper contracts implementing ERC-6123 semantics on encrypted state

3. **Selective Disclosure Layer**

   - Regulator view keys for scoped audit access
   - Time-bound, threshold-controlled disclosure

4. **Conditional Settlement Infrastructure**

   - ERC-7573 integration for coordinated cross-network settlement relayer (conditional atomicity, not strict atomicity)
   - Cross-chain compatibility for diverse collateral
   - Automated unwind triggers on margin breaches

### Vendor Recommendations

**Primary Infrastructure:**

- **Shielding Options:**
  - **Privacy L2:** Aztec Network for native privacy
  - **Shielded Pools:** [Railgun](../vendors/railgun.md) UTXO-style privacy (L1/L2 compatible)
- **ZK Proving:** Groth16 for cost-efficient proofs, PLONK for flexibility
- **Oracles:** Privacy-preserving price feeds

**Alternative/Emerging:**

- **FHE Approach:** [Zama](../vendors/zama.md) fhEVM for homomorphic computation on encrypted balances
- **Intent-Based:** [Orion Finance](../vendors/orion-finance.md) for encrypted portfolio management integration

### Implementation Strategy

**Phase 1: Core Privacy Infrastructure**

- Deploy shielded pool contracts (privacy L2 or L1/L2 compatible)
- Implement ZK circuits for ERC-6123 wrapper contracts
- Oracle integration with price feeds and settlement triggers

**Phase 2: Regulatory & Compliance**

- Selective disclosure mechanism (viewing keys, ZK proofs)
- Regulatory reporting interfaces

**Phase 3: Production & Ecosystem**

- Multi-collateral margin support (USDC, EURC, etc.)
- ERC-7573 conditional settlement coordination
- Integration with institutional custody and risk management systems

## More Details

### Trade-offs

**ZK vs FHE Decision:**

- **ZK Approach (Recommended):** Lower ongoing costs, mature tooling, better regulatory precedent
- **FHE Approach:** Simpler programming model, higher gas and computational costs, newer technology

**L1 vs L2 Trade-offs:**

- **L2 Benefits:** Lower costs, faster finality, privacy-native infrastructure
- **L1 Benefits:** Maximum security, broader ecosystem compatibility
- **Recommendation:** Privacy L2 with L1 anchoring for critical state

**Proving Frequency:**

- **Daily (Recommended):** Matches typical derivatives settlement, manageable costs
- **Real-time:** Higher privacy but prohibitive proving costs
- **Weekly/Monthly:** Lower costs but reduces automation benefits

### Open Questions

1. **Circuit Complexity:** How to handle complex derivatives (multi-underlying, path-dependent) within practical proof constraints?

2. **Cross-jurisdictional Compliance:** Standardization of selective disclosure formats across regulatory regimes?

3. **Liquidity Fragmentation:** Impact of privacy requirements on market maker participation and price discovery?

4. **Key Recovery:** Institutional-grade key management for long-lived derivatives positions?

5. **Interoperability:** Standards for private derivatives interaction with broader DeFi ecosystem?

### Alternative Approaches Considered

**CoSNARK (Complex Products)**

- Use case: Multi-asset baskets, structured products
- Trade-off: Higher complexity, better privacy for proprietary strategies
- Pattern: [Co-SNARK](../patterns/pattern-co-snark.md), Vendor: [TACEO Merces](../vendors/taceo-merces.md)

## Links and Notes

- **Standards:** [ERC-6123](https://eips.ethereum.org/EIPS/eip-6123), [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573)
- **Research:** [ICMA BDT Data Model](../patterns/pattern-icma-bdt-data-model.md) for traditional finance integration
- **Regulatory:** [eWpG Compliance](../jurisdictions/de-eWpG.md), [MiCA Framework](../jurisdictions/eu-MiCA.md)
- **Related Use Cases:** [Private Bonds](../use-cases/private-bonds.md), [Private Stablecoins](../use-cases/private-stablecoins.md)

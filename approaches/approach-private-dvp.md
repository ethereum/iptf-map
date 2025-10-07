# Approach: Private Delivery-versus-Payment (DvP)

**Use Case Links:**

- [Private Bonds](../use-cases/private-bonds.md)
- [Private RWA Tokenization](../use-cases/private-rwa-tokenization.md)

**High-level goal:** Enable atomic delivery-versus-payment settlement with confidential amounts and counterparties while maintaining regulatory auditability and eliminating settlement risk.

## Overview

### Problem Interaction

Traditional DvP requires coordinating two fundamental challenges:

1. **Settlement Risk**: Ensuring atomic delivery of assets against payment without counterparty default
2. **Information Leakage**: Preventing competitors from observing trading strategies through on-chain analysis

These problems interact because atomic settlement typically requires transparent on-chain coordination, while privacy mechanisms often break the synchronization needed for true DvP. The solution requires cryptographic techniques that enable verifiable atomic execution on private state.

### Key Constraints

- Must maintain atomicity (true atomicity within single network, conditional atomicity across networks)
- Cross-network settlement between different asset types and chains
- Regulatory oversight requiring selective disclosure capabilities
- Integration with existing custodial and settlement infrastructure
- Daily settlement cycles with economically viable costs

### TLDR for Different Personas

- **Business:** Execute bond trades and asset transfers atomically while hiding volumes and positions from competitors
- **Technical:** Combine ERC-7573 atomic settlement with privacy L2 execution for confidential but verifiable DvP
- **Legal:** Maintains regulatory oversight through selective disclosure while protecting proprietary trading information

## Architecture and Design Choices

### Recommended Architecture: Privacy L2 + Atomic Settlement

**Primary Pattern:** [ERC-7573 DvP](../patterns/pattern-dvp-erc7573.md)
**Supporting Patterns:**

- [Private L2s](../patterns/pattern-privacy-l2s.md)
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [Selective Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md)
- [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md)

#### Core Components:

1. **Atomic Settlement Layer (ERC-7573)**

   - Cross-network settlement coordination
   - Cryptographic commitment schemes for settlement triggers
   - Timeout and rollback mechanisms for failed settlements
   - Support for multi-leg transactions (cash + multiple assets)

2. **Privacy Execution Environment**

   - **Option A:** Privacy L2 (Aztec, Fhenix) with native confidential assets
   - **Option B:** Shielded pools on L1/L2 with encrypted state
   - **Option C:** FHE-based confidential contracts (Zama fhEVM)

3. **Cross-Chain Bridge Infrastructure**

   - Secure asset bridging between L1 and privacy L2
   - State commitment anchoring for finality guarantees
   - Optimistic or ZK-based bridge verification

4. **Regulatory Compliance Layer**

   - Selective disclosure mechanisms for trade reporting
   - EAS attestation logging for audit trails
   - Time-bounded viewing keys for regulatory access

### Vendor Recommendations

**Primary Infrastructure:**

- **Privacy L2:** Aztec Network for shielded asset infrastructure
- **Atomic Settlement:** Native ERC-7573 implementations with Chainlink ACE for compliance
- **Stablecoins:** Circle USDC with privacy L2 bridge support

**Alternative Approaches:**

- **FHE Path:** [Zama](../vendors/zama.md) fhEVM for homomorphic DvP computation
- **Intent-Based:** [Orion Finance](../vendors/orion-finance.md) for institutional portfolio settlement

### Implementation Strategy

**Phase 1: Single-Chain Private DvP**

- Deploy shielded asset contracts via:
  - **Privacy L2:** Native confidential assets on Aztec/Fhenix
  - **L1 Shielding:** Railgun-style commitment pools on Ethereum
  - **L2 Shielding:** Privacy Pools on Polygon/Arbitrum
- Implement basic ERC-7573 settlement within chosen environment
- Single-currency bond trading with confidential amounts

**Phase 2: Cross-Chain Atomic Settlement**

- L1 ↔ L2 bridge integration with ERC-7573
- Multi-currency support (USDC, EURC, tokenized assets)
- Regulatory disclosure infrastructure

**Phase 3: Multi-Asset Portfolio Settlement**

- Complex DvP with multiple asset legs
- Integration with traditional settlement systems
- Advanced privacy features (stealth addresses, etc.)

## More Details

### Trade-offs

**Privacy L2 vs L1 Shielded Pools:**

- **L2 Benefits:** Native privacy, lower costs, better UX for private assets
- **L1 Benefits:** Maximum security, simpler bridge complexity, broader ecosystem
- **Recommendation:** Privacy L2 for execution with L1 anchoring for critical state

**Single-Network vs Cross-Network Atomicity:**

- **Single Network:** True atomicity within one blockchain (all-or-nothing in single transaction)
- **Cross-Network:** Conditional atomicity via ERC-7573 coordination (deterministic settlement with rollback)
- **Hybrid:** True atomicity within each network, conditional coordination between networks

**FHE vs ZK Privacy:**

- **FHE (Zama):** Simpler programming model, higher ongoing costs
- **ZK (Aztec):** Better cost efficiency, more complex development
- **Recommendation:** ZK for production scale, FHE for rapid prototyping

### Open Questions

1. **Settlement Finality:** How to handle L1↔L2 finality differences in conditional settlement coordination?

2. **Regulatory Standards:** Standardization of selective disclosure formats across jurisdictions?

3. **Cross-Chain Coordination:** Managing conditional settlement across multiple privacy L2s?

4. **Custodial Integration:** Bridging between on-chain privacy and traditional custody systems?

5. **Liquidity Fragmentation:** Impact of privacy requirements on market depth and price discovery?

### Alternative Approaches Considered

**MPC Coordination**

- Use case: Multi-party settlement with complex privacy requirements
- Trade-off: Higher complexity vs granular privacy control
- Pattern: [MPC Custody](../patterns/pattern-mpc-custody.md)

**HTLC-Based (Legacy)**

- Use case: Simple atomic swaps without complex settlement logic
- Trade-off: Brittleness vs simplicity, being phased out for ERC-7573

## Example Scenarios

### Scenario 1: Private Bond Settlement

- Bank A sells €5M government bond to Bank B
- Settlement: Bond delivery on Aztec L2, EURC payment on L1
- Privacy: Trade amount and positions hidden, counterparties visible
- Compliance: Regulator receives time-bounded viewing key, logged in EAS

### Scenario 2: Multi-Asset Portfolio Transfer

- Asset manager transfers mixed portfolio (bonds + equities) to pension fund
- Settlement: Atomic delivery of 5 assets against single USD payment
- Privacy: Portfolio composition and values confidential
- Compliance: Trade reporting via ZK proofs to regulatory node

## Links and Notes

- **Standards:** [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573), [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [EIP-6123](https://eips.ethereum.org/EIPS/eip-6123), [ICMA BDT](../patterns/pattern-icma-bdt-data-model.md), [ISO 20022](../patterns/pattern-private-iso20022.md)
- **Infrastructure:** [Aztec Network](https://docs.aztec.network/), [Zama fhEVM](https://docs.zama.ai/fhevm)
- **Related Approaches:** [Private Derivatives](../approaches/approach-private-derivatives.md), [Private Stablecoins](../approaches/approach-shielded-stablecoins.md)

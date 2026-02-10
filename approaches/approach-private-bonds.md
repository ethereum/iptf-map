# Approach: Private Bond Issuance & Trading

**Use Case Link:** [Private Bonds](../use-cases/private-bonds.md)

**High-level goal:** Enable institutional bond issuance and trading on public blockchains with confidential amounts, positions, and trade details while maintaining regulatory compliance, DvP settlement, and economically viable operations.

## Overview

### Problem Interaction

Private bond trading addresses three interconnected challenges:

1. **Market Protection**: Hide volumes, prices, and positions to prevent front-running and competitive intelligence gathering
2. **Regulatory Compliance**: Provide selective disclosure capabilities for compliance (e.g., eWpG/MiCA) and crypto-registry integration
3. **Settlement Efficiency**: Ensure atomic delivery-versus-payment with predictable costs and daily settlement cycles

These problems interact because traditional bond trading requires transparent price discovery and settlement coordination, while institutional privacy needs conflict with public blockchain transparency. The solution requires privacy-preserving infrastructure that maintains market efficiency and regulatory oversight.

### Key Constraints

- Must comply with different regulations and crypto-registry requirements
- Atomic DvP settlement with minutes-level finality acceptable
- Pre-trade privacy for RFQ processes and order flow
- Production timeline of 1-2 years with proven infrastructure
- Same-chain atomic DvP acceptable; cross-chain DvP requires trusted relayer or bridging

### TLDR for Different Personas

- **Business:** Execute bond issuance and trading privately on a fully automated, 24/7 market while maintaining regulatory compliance and operational efficiency
- **Technical:** Arbitrage between turnkey solutions using familiar Solidity patterns or ramping up on ZK tooling for a tighter fit with privacy requirements; choose your level of abstraction from custom circuit implementation to coprocessor-based approaches
- **Legal:** Map each jurisdiction's disclosure requirements (eWpG, MiCA, crypto-registries) to concrete selective-disclosure mechanisms; decide between always-on audit access via viewing keys, on-demand proof generation, or programmable compliance rules embedded in the protocol

## Architecture and Design Choices

### Fundamental Choice: UTXO vs Account Model

| Model                      | Privacy   | How it Works                                                                         |
| -------------------------- | --------- | ------------------------------------------------------------------------------------ |
| **Account-based (ERC-20)** | Bolted-on | Balances public by default; privacy added via encryption wrappers or shielding pools |
| **UTXO-based (Notes)**     | Native    | Value stored as hidden commitments; only nullifiers revealed on spend                |
| **Native Privacy L2**      | Native    | Private state at protocol level (e.g., Aztec notes)                                  |

**Recommendation:** UTXO-based notes with zero-knowledge proofs provide privacy by default. This model is battle-tested (Zcash, Railgun) and scales with chain throughput. Compliance layers via selective disclosure rather than retrofitting onto transparent base.

### Recommended Architecture: UTXO Shielded Notes

**Primary Pattern:** [Shielding](../patterns/pattern-shielding.md) with zero-knowledge circuits
**Supporting Patterns:**

- [ZK Shielded Balances](../patterns/pattern-zk-shielded-balances.md)
- [Privacy L2s](../patterns/pattern-privacy-l2s.md)
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md)
- [ICMA BDT Data Model](../patterns/pattern-icma-bdt-data-model.md)

#### Core Components

- **Notes:** Bonds as UTXO notes (commitments hide amount + owner); JoinSplit circuits for transfers; Merkle tree + nullifier set
- **Identity:** Dual model — transport address (gas, KYC) + shielded keypair (spending, viewing)
- **Issuance/Redemption:** Global note split into holder notes; burn proof for settlement
- **Settlement:** Same-chain atomic DvP; cross-chain requires trusted relayer/bridge

#### Why UTXO-Based Notes?

PoC implementations demonstrate UTXO's advantages for institutional adoption:

- **Production Maturity:** Railgun live since 2021 (Total volume > $4b) with mainnet deployments (vs testnet alternatives)
- **Strongest Privacy:** Hides amounts, counterparties, AND addresses (through gas relayer), while account based solutions leak addresses
- **Vendor Ecosystem:** White-label solutions available ([Paladin](../vendors/paladin.md), [Railgun](../vendors/railgun.md)) reduce implementation burden
- **Trade-off:** More complex cryptographic model (ZK circuits) vs simpler account-based approaches, but vendors abstract this complexity

### Alternative Architectures

**Option A: Privacy L2s**

- Bonds as native private notes with protocol-level privacy
- No shielding implementation overhead — private notes is part of the execution model
- Compliance via private contracts and selective disclosure
- Trade-off: Ecosystem maturity, unknown throughput
- See: [Privacy L2s](../patterns/pattern-privacy-l2s.md), [Aztec Network](../vendors/aztec.md), [Miden](../vendors/miden.md)

**Option B: Coprocessor Models**

These approaches delegate privacy computation to specialized networks, trading self-custody for external trust assumptions.

_Co-SNARKs (MPC-Based):_

- **Architecture:** 3-party MPC network with collaborative Groth16 proving, secret-shared balances offchain
- **Trust Model:** Full honesty required, currently 3-of-3, all nodes must be honest (no threshold tolerance)
- **Privacy:** Amounts hidden, addresses visible
- **Performance:** ~95k gas/tx (batched), ~200 TPS, batch latency (~50 txs per proof)
- **Benefits:** Lower overhead than FHE, native ZK verifiability, account-model simplicity
- **Trade-offs:** Requires MPC infrastructure, batch delays, testnet maturity
- **When to Choose:** Institutional custodial models acceptable, amount confidentiality sufficient, MPC ops manageable
- See: [co-SNARK Pattern](../patterns/pattern-co-snark.md), [TACEO Merces](../vendors/taceo-merces.md)

_FHE-Based:_

- **Architecture:** Encrypted balances with homomorphic computation, threshold decryption network
- **Trust Model:** t-of-n threshold network for decryption keys
- **Privacy:** Amounts hidden, addresses visible, ACL-based access control
- **Performance:** ~300k gas/tx, shared 500-1000 TPS bottleneck across all FHE apps
- **Benefits:** Simpler programming model for complex bond logic (coupons)
- **Trade-offs:** Shared throughput limits, less mature tooling, no ACL revocation
- **When to Choose:** Complex calculations benefit from FHE, fine-grained ACL needed, custodial model acceptable
- See: [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md)

### Compliance

**Regulatory Integration Models:**

| Approach       | Viewing Key Model                   | Granularity          | Revocation                                                 |
| -------------- | ----------------------------------- | -------------------- | ---------------------------------------------------------- |
| **UTXO**       | Per-note keys via secure channel    | Per-note (custom)    | Can deny future access                                     |
| **Privacy L2** | Incoming Viewing Keys (IVKs)        | Account-level        | Can deny future access                                     |
| **co-SNARKs**  | MPC-based disclosure                | Similar to UTXO      | Depends on implementation                                  |
| **FHE**        | ACL grants (pull-based via Gateway) | Per-balance (native) | No revocation per ciphertext; requires re-grant on updates |

**Common Capabilities:**

- Whitelist enforcement (KYC-approved addresses)
- Attestations
- [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643) integration
- Crypto-registry verification for eWpG/MiCA

**Key Differences:**

- **UTXO:** Most flexible (per-note disclosure); requires trusted issuer for audit trail management
- **Privacy L2 (Aztec):** IVKs enable account-level viewing; nullifier keys are app-siloed for damage containment; coarser granularity than UTXO per-note model
- **FHE:** Per-balance ACL control; **no revocation** per ciphertext, but balance updates create new ciphertexts requiring re-grant; decryption pull-based via Gateway (must actively request)

## More Details

### Trade-offs

**Architecture Comparison:**

| Dimension              | UTXO Shielding         | Privacy L2s              | co-SNARKs (MPC)           | FHE                                    |
| ---------------------- | ---------------------- | ------------------------ | ------------------------- | -------------------------------------- |
| **Trust Model**        | Minimal (self-custody) | Minimal (client-side ZK) | Delegated (3-of-3 honest) | Delegated (threshold decrypt)          |
| **Privacy Strength**   | Amounts + addresses    | Amounts + addresses      | Amounts only              | Amounts only                           |
| **Cost per Transfer**  | High                   | Low (L2-internal)        | Low (batched)             | Medium                                 |
| **Throughput**         | Chain-dependent        | Unknown (2026)           | ~200 TPS                  | 500-1000 TPS (shared across all apps) |
| **Maturity**           | Production             | Testnet/2026             | Testnet                   | Testnet                                |
| **Ops Infrastructure** | Standard EVM           | Bridge/L2 node           | MPC network               | Threshold network                      |
| **Vendor Ecosystem**   | Paladin, Railgun       | Aztec, Miden             | TACEO                     | Zama, Fhenix                           |

### Open Questions

**Architecture & Implementation:**

1. **Multi-Asset Bond Support:** How to efficiently implement bonds with multiple tranches, currencies, or collateral types within shielded note systems?

2. **Coupon Payment Mechanisms:** What patterns enable automated, privacy-preserving coupon distribution to shielded bondholders?

3. **Cross-Chain Settlement:** Beyond same-chain atomic DvP, what trust models are acceptable for cross-chain bond settlement (relayers, bridges, messaging)?

**Market Structure:**

4. **Secondary Market Structure:** How to implement private RFQ systems while maintaining price discovery efficiency?

5. **Pre-Trade Privacy:** What level of order flow privacy is required before execution vs post-trade confidentiality?

6. **Market Data & Analytics:** How to provide bond pricing, yield curves, and market analytics while preserving transaction privacy?

**Regulatory & Integration:**

7. **Regulatory Standards:** Standardization of selective disclosure formats for eWpG/MiCA compliance across jurisdictions?

8. **Legacy Integration:** Bridging between on-chain privacy and traditional bond settlement systems (Euroclear, etc.)?

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

### Scenario 3: Government Bond with Coupons

- Government issues 5-year bond with semi-annual coupon payments, 1000+ bondholders
- Privacy: Individual positions confidential, coupon payments private
- Compliance: Regulatory audit access required

## Links and Notes

- **Reference Implementation:** [Private Bond PoC](https://github.com/ethereum/iptf-pocs/tree/master/pocs/private-bond) — Three implementations: Custom UTXO, Aztec L2, Zama FHE
- **Maturity Status (Feb 2026):** UTXO (Production: Railgun), Privacy L2s (Testnet/2026: Aztec Ignition, Miden), co-SNARKs (Testnet: TACEO Base/Arc), FHE (Testnet: Zama, Fhenix)
- **Standards:** [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643), [ICMA BDT](https://www.icmagroup.org/market-practice-and-regulatory-policy/repo-and-collateral-markets/legal-documentation/global-master-repurchase-agreement-gmra/)
- **Research:** [Private Tokenized Securities with UTXO Model](https://eprint.iacr.org/2025/1715.pdf) - UTXO-style privacy for ERC-3643 compliant securities
- **Regulations:** [eWpG](../jurisdictions/de-eWpG.md), [MiCA](../jurisdictions/eu-MiCA.md)
- **Vendor Solutions:**
  - UTXO: [Paladin](../vendors/paladin.md), [Railgun](https://railgun.org/)
  - Privacy L2: [Aztec Network](../vendors/aztec.md), [Miden](../vendors/miden.md)
  - co-SNARKs: [TACEO Merces](../vendors/taceo-merces.md)
  - FHE: [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md)
- **Related Patterns:** [co-SNARKs](../patterns/pattern-co-snark.md), [Shielding](../patterns/pattern-shielding.md)
- **Related Approaches:** [Private DvP](../approaches/approach-private-dvp.md), [Private Derivatives](../approaches/approach-private-derivatives.md)

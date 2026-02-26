# Approach: Private Money-Market Funds

**Use Case Link:** [Private Money Market Funds](../use-cases/private-money-market-funds.md)

**High-level goal:** Enable privacy-preserving money-market fund operations on Ethereum where individual positions, redemption flows, and yield attribution are hidden, while fund NAV remains publicly verifiable and operator-independent.

## Overview

### Problem Interaction

Private money-market funds address three interconnected challenges:

1. **Position & Strategy Privacy**: Hide subscription amounts, share counts, and yield optimization strategies so competitors cannot infer treasury size or cash management tactics
2. **Redemption Pattern Privacy**: Hide individual redemption timing and amounts to prevent runs triggered by visible large outflows
3. **Operator-Independent Solvency**: Ensure any party can verify fund NAV without the fund manager's cooperation, so the fund remains trustworthy even under adversarial conditions

### Key Constraints

- Daily or intraday NAV computation with verifiable correctness
- SEC Rule 2a-7 (US) and ESMA MMFR (EU) compliance for fund gates, liquidity fees, and concentration limits
- Atomic subscription/redemption settlement (no partial fills or stuck funds)
- Yield attribution must be provably correct per investor without revealing individual positions
- NAV verification must not depend on the fund operator's availability (threshold opening by t-of-n keyholders)

### TLDR for Different Personas

- **Business:** Yield-bearing treasury products where investor positions are private, redemptions are invisible to other participants, and fund solvency is verifiable by a threshold committee independent of the fund operator
- **Technical:** Shielded commitments with an incremental NAV model: a running `total_shares` commitment updated per transaction, not a monolithic proof over all positions. NAV = `total_shares * oracle_price`; periodic full-audit checkpoints; atomic ERC-7573 settlement
- **Legal:** SEC 2a-7 / ESMA MMFR requirements mapped to on-chain enforcement via ZK-proven constraints; regulator access via scoped view keys with EAS-logged disclosure

## Architecture and Design Choices

### Fundamental Choice: NAV Computation Trust Model

| Model | Privacy | Trust Assumption | Performance | Maturity |
| --- | --- | --- | --- | --- |
| **ZK** | Positions hidden inside proof | Math + threshold keyholders (t-of-n) for NAV opening | constant-cost per transaction (incremental); periodic full-audit scales with position count | PoC |
| **FHE** | Positions encrypted, computed over ciphertexts | Threshold key holders (t-of-n) | Heaviest compute; shared throughput limits | Testnet |
| **TEE** | Positions sealed in enclave | Hardware vendor (Intel/AMD) | Cheapest; near-instant | Testnet |

**Recommendation:** ZK proofs with a running `total_shares` commitment (threshold-opened by t-of-n custodians/auditors for NAV computation); periodic full-audit checkpoints off the critical path. FHE alternative for complex yield logic; TEE viable for early PoCs.

### Recommended Architecture: Shielded Share Commitments + ZK NAV Proofs

**Primary Patterns:**
- [Shielding](../patterns/pattern-shielding.md) (commitment/nullifier model for share positions)
- [Regulatory Disclosure Keys & Proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md) (view-key framework for auditors)

**Supporting Patterns:**
- [DvP via ERC-7573](../patterns/pattern-dvp-erc7573.md) (atomic subscription/redemption settlement)
- [Private Intent-Based Vaults](../patterns/pattern-private-vaults.md) (optional: yield strategy execution within the fund)
- [Compliance Monitoring](../patterns/pattern-compliance-monitoring.md) (transaction screening, concentration checks)
- [Verifiable Attestation](../patterns/pattern-verifiable-attestation.md) (EAS-based NAV attestation and audit logging)

#### Core Components

- **Share Positions:** Shielded UTXO commitments (attestation hash, share count, entry NAV); subscription mints + increments running total, redemption nullifies + decrements; atomic via ERC-7573; individual flows unlinkable
- **Running Total & NAV:** Pedersen commitment to `total_shares` updated per transaction via ZK proof; opening threshold-shared (t-of-n) among custodians/auditors; any qualifying subset opens commitment, computes NAV = `total_shares * oracle_price`, posts attestation
- **Yield Attribution:** Pro-rata and uniform; at redemption each investor proves "I hold X of total_shares, my yield is X/total_shares * total_yield"
- **Audit & Verification:** Periodic full-proof checkpoint verifies running total against all positions (expensive, off critical path); NAV verification policy (circuit hash) registered immutably at fund deployment
- **Regulatory Access:** Scoped view keys (positions, concentration, liquidity); disclosures logged via EAS

#### Operator-Independent NAV (Censorship Resistance)

On-chain proof verification guarantees `total_shares` correctness independent of any single party. If the operator disappears, any t of the remaining n-1 threshold keyholders can open the commitment, compute NAV, and post an attestation; redemptions continue without interruption.

### Alternative Architectures

**Option A: FHE-Encrypted Balances**

- Encrypted balances on FHE-enabled L2; NAV computed homomorphically, decrypted by threshold key holders
- Simpler programming model for complex yield logic; weaker operator independence (threshold holders must be available)
- Trade-off: Threshold trust; shared throughput limits; no revocation per ciphertext
- See: [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [Orion Finance](../vendors/orion-finance.md)

**Option B: TEE-Based Computation**

- Positions sealed in TEE enclave; NAV computed in the clear internally; remote-attested on-chain
- Trade-off: Hardware vendor trust; side-channel surface; enclave availability; operator independence requires open-source enclave code
- See: [TEE-Based Privacy](../patterns/pattern-tee-based-privacy.md), [TEE Key Manager](../patterns/pattern-tee-key-manager.md)

### Compliance

**Regulatory Integration Models:**

| Approach | Disclosure Mechanism | Granularity | Gate/Fee Enforcement |
| --- | --- | --- | --- |
| **ZK (UTXO)** | Per-commitment view keys | Per-position | Encoded in ZK circuit |
| **FHE** | ACL grants via Gateway | Per-balance | Native encrypted logic |
| **TEE** | Enclave-mediated disclosure | Configurable | Internal enclave logic |

**Common Capabilities:**

- KYC eligibility gating; concentration limit enforcement in ZK
- Liquidity stress testing via view keys; aggregate fund flow reporting (delayed, non-identifying)

**Fund-Specific Regulatory Requirements:**

- **SEC Rule 2a-7 (US):** Liquidity fee/gate thresholds enforced in ZK circuit as public outputs
- **ESMA MMFR (EU):** Maturity limits and stress testing obligations; view-key scoping supports jurisdiction-specific disclosure

## More Details

### Trade-offs

**Architecture Comparison:**

| Dimension | ZK Shielded Commitments | FHE Encrypted Balances | TEE Enclave |
| --- | --- | --- | --- |
| **Trust Model** | Math + threshold keyholders (t-of-n) for NAV opening | Threshold key holders (t-of-n) | Hardware vendor |
| **Privacy Strength** | Amounts + addresses | Amounts only (addresses visible) | Amounts + addresses (inside enclave) |
| **NAV Proof Cost** | Low (incremental); periodic full-audit scales with positions | High (FHE compute) | Low (native compute) |
| **Operator Independence** | Strong (any t-of-n subset, operator not required) | Moderate (threshold holders needed) | Moderate (enclave must be available) |
| **Redemption Latency** | Seconds to minutes | Seconds to minutes | Near-instant |
| **Maturity** | PoC (Railgun model) | Testnet (Zama, Fhenix) | Testnet |
| **Vendor Ecosystem** | [Paladin](../vendors/paladin.md), [Railgun](../vendors/railgun.md), [Privacy Pools](../vendors/privacypools.md) | [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [Orion Finance](../vendors/orion-finance.md) | [Soda Labs](../vendors/soda-labs.md) |

### Open Questions

1. How do we optimally balance the privacy gains of fungible shares against the complexity of attributing yield across different entry-NAV cohorts?
2. Can shielded MMF shares be traded peer-to-peer with privately enforced NAV-based pricing?
3. How to handle mixed-currency underlying while keeping currency exposure private?
4. Can MMF shares serve as a cash-equivalent in DvP settlement for other instruments?

## Example Scenarios

### Scenario 1: Institutional Treasury Subscription

- Corporate treasurer subscribes $50M USDC to a private T-bill MMF
- Privacy: Position size invisible on-chain; only the treasurer and fund auditor see it
- Settlement: Atomic via ERC-7573; USDC transferred, share commitment minted, running `total_shares` incremented in one transaction
- NAV: Threshold keyholders (t-of-n custodians/auditors) jointly open the updated `total_shares` commitment, multiply by T-bill oracle price, and post a publicly verifiable NAV attestation

### Scenario 2: Operator-Independent NAV Verification

- Fund operator goes offline; threshold subset (t of n-1, excluding operator) opens `total_shares` commitment
- They compute NAV = `total_shares * oracle_price`, post attestation on-chain; redemptions continue without interruption
- Same subset triggers a full-audit checkpoint to confirm the running total

### Scenario 3: Private Redemption Under Stress

- A bank redeems $200M from the fund during a market stress event
- Privacy: The $200M redemption is invisible to other fund participants; no panic signal
- Compliance: Fund circuit proves "post-redemption liquidity ratio > 30%" (no gate triggered) without revealing the redemption amount
- Settlement: Atomic via ERC-7573; share commitment nullified, USDC released

## Links and Notes

- **Related Use Cases:** [Private Stablecoins](../use-cases/private-stablecoins.md), [Private Treasuries](../use-cases/private-treasuries.md), [Private RWA Tokenization](../use-cases/private-rwa-tokenization.md)
- **Standards:** [ERC-7573](https://eips.ethereum.org/EIPS/eip-7573), [EAS](https://attest.org/), [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643)
- **Regulations:** [SEC Rule 2a-7](https://www.sec.gov/rules/final/ic-29132.htm), [ESMA MMFR](https://www.esma.europa.eu/data-reporting/mmfr-reporting)
- **Vendor Solutions:**
  - ZK/UTXO: [Paladin](../vendors/paladin.md), [Railgun](../vendors/railgun.md), [Privacy Pools](../vendors/privacypools.md)
  - FHE: [Zama](../vendors/zama.md), [Fhenix](../vendors/fhenix.md), [Orion Finance](../vendors/orion-finance.md)
  - MPC/GC: [Soda Labs](../vendors/soda-labs.md)
- **Related Patterns:** [Shielding](../patterns/pattern-shielding.md), [Private Vaults](../patterns/pattern-private-vaults.md), [ZK Shielded Balances](../patterns/pattern-zk-shielded-balances.md), [Regulatory Disclosure](../patterns/pattern-regulatory-disclosure-keys-proofs.md), [DvP ERC-7573](../patterns/pattern-dvp-erc7573.md), [Compliance Monitoring](../patterns/pattern-compliance-monitoring.md)
- **Related Approaches:** [Private Bonds](./approach-private-bonds.md), [Private DvP](./approach-dvp-atomic-settlement.md)

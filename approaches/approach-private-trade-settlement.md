# Approach: Private Trade Settlement

**Use Case Links:**

- [Private Bonds](../use-cases/private-bonds.md)
- [Private RWA Tokenization](../use-cases/private-rwa-tokenization.md)
- [Private Derivatives](../use-cases/private-derivatives.md)

**High-level goal:** Enable confidential settlement of institutional trades while maintaining atomicity, regulatory compliance, and operational efficiency. Same-network settlement provides true atomicity (single transaction). Cross-network settlement requires trust assumptions — no trustless solution exists today.

**Companion document:** [Atomic DvP Settlement](approach-dvp-atomic-settlement.md) covers atomicity primitives (HTLCs, escrow, oracle-based conditional transfers). This document focuses on how to add privacy to settlement.

## Overview

### Problem Interaction

Institutional trade settlement requires balancing:

1. **Privacy vs Transparency**: Trading strategies, positions, and counterparty relationships must remain confidential while providing regulatory oversight and settlement assurance
2. **Atomicity**: Both legs of a trade must settle together or not at all — partial settlement creates counterparty risk
3. **Cross-Domain Coordination**: Assets and cash may reside on different networks optimized for different purposes (liquidity vs privacy)
4. **Compliance**: Cross-border regulatory requirements with varying privacy and disclosure rules

The core tension: on a single network, atomicity is trivial (one transaction settles both legs). Across networks, atomicity and privacy become competing constraints — revealing state to coordinate settlement undermines the privacy that motivated using separate networks.

### Key Constraints

- Atomic DvP: both legs complete or neither does (see [Atomic DvP Settlement](approach-dvp-atomic-settlement.md) for mechanisms)
- Support for institutional settlement patterns (DvP, PvP, multi-leg trades)
- Integration with existing custody infrastructure and compliance workflows
- Selective disclosure for regulators across jurisdictions

### TLDR for Different Personas

- **Business:** Settle trades privately on-chain. Same-network for guaranteed atomicity, cross-network when liquidity or regulation forces it — with explicit trust tradeoffs
- **Technical:** Same-chain: shielded pool DvP or privacy L2 native contracts. Cross-chain: TEE+ZK coordination, MPC threshold, or intent-based settlement — each with different trust models
- **Legal:** Selective disclosure mechanisms provide regulatory access. Trust model varies by approach — from cryptographic-only (same-chain ZK) to hardware trust (TEE) to economic guarantees (intents). Counterparty risk also varies: true atomicity on a single chain vs trusted bridges across two networks

## Architecture and Design Choices

### Single-Chain Private Settlement

On a single network, a smart contract can execute both legs in one transaction — atomicity is an inherent blockchain property, so the challenge is purely about privacy.

Privacy strength scales with anonymity set size: larger pools make individual transactions harder to distinguish. Institutions, however, need KYC'd and regulated counterparties, which restricts who can enter the pool and shrinks the set. An open permissionless pool maximizes privacy but mixes compliant and non-compliant actors; a permissioned-only pool satisfies compliance but may be too small for meaningful anonymity. [Privacy Pools](../vendors/privacypools.md) explore a middle path through association sets — participants transact in a shared pool but prove membership in a compliant subset without revealing their identity within it. The right balance remains jurisdiction-, asset-class-, and risk-appetite-dependent.

#### Approach A: UTXO Shielded Pool DvP

**Primary Pattern:** [Shielding](../patterns/pattern-shielding.md) with [ZK Shielded Balances](../patterns/pattern-zk-shielded-balances.md)

Both counterparties hold assets in a shielded pool (Railgun, Privacy Pools). Settlement executes as coordinated JoinSplit operations within the pool — consuming input notes and producing output notes in a single atomic transaction.

- **Primitives**: Shielded pool, JoinSplit circuits, Merkle tree, nullifier set, view keys
- **Trust model**: Cryptographic only — no hardware or operator trust. Privacy guaranteed by zero-knowledge proofs
- **Privacy**: Amounts, counterparties, and addresses hidden. Anonymity set is the entire shielded pool
- **Maturity**: Production (Railgun live since 2021, >$4B total volume)
- **Caveats**: Higher gas costs on L1. UTXO off-ramping to public ERC-20 requires unshielding, which creates linkability. Privacy set size on L1 affects anonymity guarantees. Relayer needed for full address privacy

**Vendors:** [Railgun](../vendors/railgun.md), [Paladin](../vendors/paladin.md) (white-label), [Privacy Pools](../vendors/privacypools.md)

#### Approach B: Privacy L2 Native DvP

**Primary Pattern:** [Privacy L2s](../patterns/pattern-privacy-l2s.md)

Deploy both asset and payment contracts on a privacy L2 where private state is a first-class primitive. DvP executes as a native private contract call — no shielding/unshielding overhead.

- **Primitives**: L2 encrypted state, private smart contracts, validity proofs, native notes
- **Trust model**: L2 sequencer (liveness), validity proofs on L1 (correctness), Data Availability layer
- **Privacy**: Protocol-level encryption of all state. Nullifier keys are app-siloed for damage containment
- **Maturity**: Emerging — Aztec testnet (2026), Miden in development
- **Caveats**: Bridge risk for assets entering/exiting L2. Ecosystem maturity and tooling still early. Throughput characteristics unknown at scale

**Vendors:** [Aztec Network](../vendors/aztec.md), [Miden](../vendors/miden.md)

#### Single-Chain Trade-off Summary

| Dimension | UTXO Shielded Pool | Privacy L2 |
|-----------|-------------------|------------|
| **Privacy** | Amounts + addresses | Full state encryption |
| **Cost** | Medium-high (L1 gas) | Low (L2 execution) |
| **Maturity** | Production | Testnet (2026) |
| **Composability** | Shielded pool + DeFi via Adapt Modules | Within L2 ecosystem |
| **Off-ramping** | Unshield to ERC-20 (linkability) | Bridge to L1 (bridge risk) |

### Cross-Chain Private Settlement

**No trustless atomic cross-chain private settlement solution exists.** Networks are independent — a transaction can succeed on one chain while reverting on another. All cross-chain approaches introduce trust assumptions beyond cryptography.

For atomicity mechanisms (HTLCs, escrow, conditional transfers), see [Atomic DvP Settlement](approach-dvp-atomic-settlement.md). Below covers how to add privacy to cross-chain coordination.

#### Approach A: TEE+ZK Coordination

**Primary Pattern:** [Hybrid TEE + ZK Settlement](../patterns/pattern-tee-zk-settlement.md)

A TEE coordinator matches orders privately, generates zero-knowledge proofs of correct execution, and coordinates settlement across chains using stealth addresses with timeout-based refunds.

- **Primitives**: Attested TEEs, zero-knowledge proofs, stealth addresses (EIP-5564), dual spending conditions (stealth key OR timeout refund)
- **Trust model**: Hardware vendor can observe plaintext during execution. Attestation infrastructure must be verified
- **Atomicity**: Timeout-based, not cryptographic — if TEE fails mid-settlement, funds are recoverable after timeout but not atomically settled
- **Best for**: Institutional contexts where hardware trust is already accepted (HSM infrastructure, custodial environments)
- **Maturity**: PoC stage

#### Approach B: MPC/Threshold Settlement

A distributed committee of MPC nodes coordinates settlement. Threshold signatures authorize transfers on each chain, with slashing for misbehavior.

- **Primitives**: MPC committee, threshold signatures (t-of-n), slashing contracts, encrypted state sharing
- **Trust model**: Honest majority — assumes fewer than t nodes collude. Economic security via staked collateral
- **Atomicity**: Economic — misbehavior results in slashing penalties, not cryptographic prevention
- **Best for**: Decentralized coordination without hardware trust. Scenarios requiring auditability of the coordination layer
- **Maturity**: Emerging (threshold networks exist, private settlement coordination is novel)

#### Approach C: Intent-Based Settlement (EIP-7683)

Parties express settlement intents. Competitive solvers fill orders using their own capital across chains, then settle with the protocol.

- **Primitives**: [EIP-7683](https://eips.ethereum.org/EIPS/eip-7683) cross-chain intents, solver/filler network, reputation systems, collateral pools
- **Trust model**: Economic — solver incentives, collateral adequacy, and reputation. No hardware or cryptographic trust in the coordination layer
- **Atomicity**: Economic — solvers bear execution risk and are compensated for it
- **Privacy**: Variable — intents are visible to solvers (privacy-preserving solver discovery is an open problem). Settlement execution can integrate with private payment rails
- **Best for**: Asynchronous settlement where slight timing flexibility is acceptable. Competitive execution and price improvement
- **Maturity**: Early production (EIP-7683 standard published, solver networks emerging)

#### Cross-Chain Trade-off Summary

| Dimension | TEE+ZK | MPC/Threshold | Intent-Based |
|-----------|--------|---------------|-------------|
| **Trust** | Hardware vendor | Honest majority (t-of-n) | Economic incentives |
| **Privacy** | Strong (encrypted coordination) | Strong (MPC) | Weak (intents visible to solvers) |
| **Atomicity** | Timeout-based | Economic (slashing) | Economic (solver risk) |
| **Latency** | Low (enclave speed) | Medium (MPC rounds) | Variable (solver competition) |
| **Maturity** | PoC | Emerging | Early production |

### Compliance

All approaches support selective disclosure via [regulatory disclosure keys and proofs](../patterns/pattern-regulatory-disclosure-keys-proofs.md). Per-note viewing keys (UTXO), incoming viewing keys (Privacy L2), or TEE-mediated disclosure provide regulator access without breaking privacy for other parties. See [Private Bonds: Compliance](approach-private-bonds.md) for detailed comparison.

## More Details

### Implementation Recommendations

**Decision framework:** Choose same-network settlement if both assets can coexist on one network. Resort to cross-network only when liquidity fragmentation or regulatory constraints force it.

- **Phase 1**: Single-network private DvP on production infrastructure (shielded pool)
- **Phase 2**: Multi-asset settlement on same network (bonds + cash + collateral)
- **Phase 3**: Cross-network coordination with TEE or MPC if required by use case

### Research Directions

These approaches are not production-ready but may reshape cross-chain private settlement:

- **Realtime proving**: [Synchronous cross-rollup composability](https://ethresear.ch/t/synchronous-composability-between-rollups-via-realtime-proving/23998) via validity proofs generated within block time. Enables true atomic cross-rollup transactions but requires shared sequencing infrastructure
- **Based sequencing**: L1 proposers sequence L2 transactions, potentially enabling atomic L1↔L2 settlement without trusted intermediaries
- **Privacy-preserving solver networks**: Encrypted intent discovery and execution for EIP-7683 — would address the privacy gap in intent-based settlement

### Open Questions

1. **Privacy set economics**: What minimum shielded pool size provides adequate anonymity for institutional trade sizes?
2. **Cross-chain necessity**: Can tokenized deposit networks (EURC, USDC) deploy on privacy L2s to eliminate cross-chain needs for cash legs?
3. **Regulatory acceptance**: Which trust models (TEE, MPC, economic) satisfy regulatory requirements across jurisdictions?
4. **Solver privacy**: Can intent-based architectures preserve order privacy while enabling competitive execution?

## Example Scenarios

### Scenario 1: Same-Chain Bond DvP (Shielded Pool)

- Asset manager sells EUR 25M corporate bonds to bank counterparty
- Both parties hold assets in Railgun shielded pool on Ethereum L1
- Coordinated JoinSplit: bond notes consumed, EURC notes consumed, new notes created for each party
- Single atomic transaction — no coordination risk
- Regulator receives viewing key for audit access to both sides

### Scenario 2: Cross-Chain Bond Settlement (TEE+ZK)

- European issuer's bonds on privacy L2, buyer's USDC on Ethereum L1
- TEE coordinator matches and validates, locks notes to stealth addresses with 24h timeout
- Zero-knowledge proof submitted on-chain, TEE reveals stealth keys on success
- Failure path: TEE crash → both parties reclaim via timeout refund

### Scenario 3: Multi-Currency PvP (Intent-Based)

- Treasury desk swaps EUR stablecoin (Chain A) for USD stablecoin (Chain B)
- Publishes EIP-7683 intent with amount and acceptable rate
- Solver fills order from own inventory on both chains, settles atomically from solver's perspective
- Treasury receives fill on destination chain — solver assumes cross-chain execution risk

## Links and Notes

- **Standards:** [ERC-7573](https://ercs.ethereum.org/ERCS/erc-7573) (cross-network DvP, draft), [EIP-7683](https://eips.ethereum.org/EIPS/eip-7683) (cross-chain intents), [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643) (permissioned tokens), [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564) (stealth addresses)
- **Patterns:** [Hybrid TEE + ZK Settlement](../patterns/pattern-tee-zk-settlement.md), [DvP ERC-7573](../patterns/pattern-dvp-erc7573.md), [Shielding](../patterns/pattern-shielding.md), [Privacy L2s](../patterns/pattern-privacy-l2s.md), [Cross-Chain Privacy Bridge](../patterns/pattern-cross-chain-privacy-bridge.md), [ZK-SPV Verification](../patterns/pattern-zk-spv.md)
- **Related Approaches:** [Atomic DvP Settlement](approach-dvp-atomic-settlement.md) (atomicity mechanisms), [Private Payments](approach-private-payments.md), [Private Bonds](approach-private-bonds.md)
- **Research:** [Synchronous composability via realtime proving](https://ethresear.ch/t/synchronous-composability-between-rollups-via-realtime-proving/23998)
- **Regulatory:** [eWpG Compliance](../jurisdictions/de-eWpG.md), [MiCA Framework](../jurisdictions/eu-MiCA.md)

---
title: "Vendor: Aztec Rollup"
status: draft
maturity: testnet
---

# Aztec - Aztec Rollup (privacy L2 with programmable zk circuits)

## What it is

Aztec is a zero-knowledge rollup on Ethereum that enables private transactions and programmable privacy.  
It uses zkSNARKs (Plonk/Honk/Ultra) to batch transactions and supports a UTXO-style model with note commitments, enabling shielded transfers and private DeFi logic.

## Fits with patterns (names only)

- Pattern: Private ISO 20022 Messaging & Settlement
- Pattern: Shielded-Pool Atomic Swap (ZK-HTLC)
- Pattern: ZK Shielded Balances for Derivatives
- Pattern: Confidential ERC-20 (L2; ERC-7573)

## Not a substitute for

- Not a settlement rail across multiple L1s (atomic cross-chain DvP still requires zk-SPV or bridges).
- Does not provide field-level ISO message commitments (off-chain parsing still required).
- Not a compliance/audit orchestration layer (requires scoped keys or external disclosure service).

## Architecture

- **Execution model**: Hybrid account/UTXO system; user balances are represented as encrypted notes.
- **Proof system**: UltraPlonk-based zkSNARKs aggregate rollup state transitions.
- **DA model**: Rollup posts data to Ethereum L1 (currently calldata, migrating to EIP-4844 blobs).
- **Settlement**: ERC-20 tokens are wrapped into shielded Aztec assets.
- **Interoperability**: Contracts can enforce conditional transfers (similar to ERC-7573 semantics) while keeping values private.

## Privacy domains

- **Private transfers**: Default shielding of token amounts, counterparties hidden from public chain.
- **Selective disclosure**: Users can export viewing keys for auditors/regulators.
- **Programmable privacy**: Circuits allow private execution of DeFi-like logic (DEX, lending) within Aztec.

## Enterprise demand and use cases

- **Financial institutions**: private stablecoin transfers and settlement.
- **Asset managers**: confidential DeFi strategies and portfolio movements.
- **Corporate treasuries**: cross-border payments with regulatory audit but hidden competitive data.

## Technical details

- zkSNARKs: Plonkish proving system with efficient verifier contracts.
- UTXO commitments: notes with nullifiers prevent double spends.
- Supports account abstraction and smart contract programmability.
- Relayers (Aztec Connect) allow batching of private calls into existing Ethereum DeFi protocols.

## Strengths

- Strong privacy guarantees for transfers and balances.
- Native rollup scalability with Ethereum settlement finality.
- Programmable privacy circuits extend beyond simple shielded transfers.
- Mature research team with open-source infrastructure and audits.

## Risks and open questions

- Still not production ready; testnet only.
- No native cross-chain atomicity; needs zk-SPV or trusted bridges for multi-domain DvP.
- Block finality; still not compliant for high frequency operations.
- Key management and regulator disclosure processes not standardized.
- DA model (L1 blobs vs validium) impacts trust assumptions and compliance.

## Links

- [Aztec Docs](https://docs.aztec.network/)
- [Aztec GitHub](https://github.com/AztecProtocol)
  - [Zk Backend](https://github.com/AztecProtocol/aztec-packages)
- [Aztec Medium: Rollup Architecture](https://medium.com/aztec-protocol)
- [Aztec Connect Overview](https://aztec.network/connect)

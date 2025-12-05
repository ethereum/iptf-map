---
title: "Vendor: Aztec Rollup"
status: draft
maturity: production (Ignition Chain)
---

# Aztec - Privacy Rollup

## What it is

Aztec is a privacy focused rollup (or zk-zk-rollup) on Ethereum that enables private transactions and programmable privacy. Unlike its predecessor, it is a fully programmable network where applications can access both private and public state.

It uses the **Noir** language to write zk circuits and enables a hybrid execution model: private functions execute client-side (for privacy), while public functions execute on the network (for transparency/auditability).

## Fits with patterns

- [pattern-noir-private-contracts.md](../patterns/pattern-noir-private-contracts.md) - Noir private smart contracts
- [pattern-privacy-l2s.md](../patterns/pattern-privacy-l2s.md) - Privacy-native rollup execution
- [pattern-zk-shielded-balances.md](../patterns/pattern-zk-shielded-balances.md) - Confidential balances for derivatives
- [pattern-shielding.md](../patterns/pattern-shielding.md) - Confidential ERC-20 transfers

## Not a substitute for

- Fully private EVM
- High througput but public rollups

## Architecture

- Hybrid State Model
  - Private state (UTXO-based) is managed by the PXE (Private Execution Environment) on the user's device.
  - Public state (Account-based) is managed by the AVM (Aztec Virtual Machine) on nodes.
- Smart contracts are written in [Noir](../patterns/pattern-noir-private-contracts.md).
- Proof system: Honk (UltraHonk) and UltraPlonk. Honk allows for fast recursion and removes the need for a trusted setup.
- DA model: Rollup posts data to Ethereum L1 using EIP-4844 Blobs.
- Settlement: Decentralized sequencer; L2 validity proofs are verified on Ethereum L1.

## Privacy domains

- **Private transfers**: Default shielding of token amounts, counterparties hidden from public chain.
- **Selective disclosure**: Users can export viewing keys for auditors/regulators.
- **Programmable privacy**: Circuits allow private execution of DeFi-like logic (DEX, lending) within Aztec.

## Enterprise demand and use cases

- Financial institutions: private stablecoin transfers and settlement.
- Asset managers: confidential DeFi strategies and portfolio movements.
- Corporate treasuries: cross-border payments with regulatory audit but hidden competitive data.

## Technical details

- zkSNARKs: Plonkish proving system with efficient verifier contracts.
- UTXO note commitments with nullifiers to prevent double spends.
- L1/L2 communication relies on "Portals". These are pairs of contracts (one on Ethereum L1, one on Aztec L2) that pass messages asynchronously via the rollup contract, enabling token bridges and cross-chain governance without trusted 3rd parties.
- Native account abstraction at the protocol level; all accounts are smart contracts.
- Decentralized sequencer (Fernet), block production uses a randomized leader election (VRF-based) to select sequencers, ensuring fair participation. It includes a Based Fallback mechanism, allowing users to submit transactions directly to L1 if the L2 sequencers attempt to censor them.

## Strengths

- Strong privacy guarantees for transfers and balances.
- Programmable privacy circuits extend beyond simple shielded transfers.
- Mature research team with open-source infrastructure and audits.

## Risks and open questions

- State Synchronization, users must download and trial-decrypt note history to discover their funds (cannot simply query a balance). Wallets must actively track, discover, and consume Notes, creating sync bottlenecks compared to public L2s.
- Client-Side Proving, private execution requires local proof generation (via PXE), demanding significant compute resources for end users.
- Compliance vs. Permissionlessness, While "Selective Disclosure" exists, it is unclear if regulators will accept retroactive auditing over proactive censorship (e.g., OFAC lists at the sequencer level).
- Performances, this system requires a lot of engineering at the cost of a lower throughput, raising the question of use cases that it could tackle.

## Links

- [Aztec Docs](https://docs.aztec.network/)
- [Aztec GitHub](https://github.com/AztecProtocol)
  - [Zk Backend](https://github.com/AztecProtocol/aztec-packages)
- [Aztec Medium: Rollup Architecture](https://medium.com/aztec-protocol)
- [Aztec Connect Overview](https://aztec.network/connect)

---
title: "Vendor: Soda Labs"
status: draft
maturity: mainnet (for integrated privacy) & testnet (for plug-and-play privacy) explained below
---

# Soda Labs – MPC SDK & Confidential Smart Contracts <br>(Garbled Circuit for EVM)

## What it is

Soda Labs develops **open-source Garbled Circuit-based SMPC (Secure Multiparty Computation)** tools that enable confidential smart contracts and encrypted data processing directly on EVM-compatible networks.
The Garbled Circuit–based confidential compute engine operates in two modes: integrated and plug-and-play. In the integrated mode, the MPC protocol is embedded within the consensus layer to produce a fully fledged, privacy-preserving L1 or L2. The plug-and-play mode, on the other hand, is run by an external network (called Bubble) to enable privacy on existing chains with minimal integration effort, while also supporting cross-chain functionality.

## Fits with patterns

- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md) - Garbled Circuits enable encrypted balances/amounts for confidential transfers
- [Private Intent-Based Vaults](../patterns/pattern-private-vaults.md) - Garbled Circuit-enabled chains allow private strategy execution while keeping assets auditable
- [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md) - Garbled Circuit-based implementation for confidential token transfers
- [Atomic DvP via ERC-7573 (cross-network)](../patterns/pattern-dvp-erc7573.md) - Soda Labs's Bubble Network maintains atomicity while preserving trade details private
- [Private L2s](../patterns/pattern-privacy-l2s.md) - Soda Labs's gcEVM provides Garbled Circuit-based rollup capabilities
- [Shielded Balances](../patterns/pattern-zk-shielded-balances.md) - Garbled Circuit-based implementation achieves shielding capabilities similar to those of ZK

## Not a substitute for

- ZK-based L2 privacy (e.g., Aztec, Scroll)
- MPC or TEE for custody

## Architecture

- Soda Labs provides libraries for private instruction set analogous to the set supported by the EVM.
- In runtime, once a private instruction is encountered (e.g., private-ADD256) it triggers the execution of a garbled circuit for that specific instruction (the circuit receives encrypted inputs and produces encrypted output).
- The Evaluators (i.e., the parties that are responsible for the confidential computation) are assumed to have in their posession garbled circuits for all types of instructions, and therefore they take part in a continueous process to produce those garbled circuits and maintain an inventory.
- Given that inventory of garbled circuits, processing a block that demands privacy-preserving workload is done non-interactively, following a constant number of rounds for soldering the relevant garbled circuits.


## Privacy domains

- Selective disclosure for regulatory compliance and audit trails
- Enterprise treasury operations with confidential payment flows
- Standard AES encryption at the contract and variable level
- Supports hybrid models of Garbled Cirtcuit + ZK for public auditability

## Enterprise demand and use cases

- Financial institutions seeking **on-chain confidentiality** with deterministic settlement.
- Private vaults, confidential lending, or yield strategies.

## Technical details

- EVM-compatible GC runtime (`gcEVM`)
- SDKs for Solidity and python


## Strengths

- Native EVM integration
- Strong cryptographic research pedigree
- Relies on standard and time-tested & PQ-secure encryption scheme: AES 
- GC provides the lowest latency for general-purpose confidential computation
- Cheap: runs on low-end machines (no GPUs/FPGAs/ASICs are required)


## Risks and open questions

- Interoperability between GC networks still emerging
- Standardized and audited ERC contracts is in the work
- Secure under the assumption of threshold number of honest participants (just like any other MPC/FHE)


## Links

- [https://www.sodalabs.xyz](https://www.sodalabs.xyz)
- [https://github.com/soda-mpc/gcEVM-node](https://github.com/soda-mpc/gcEVM-node)
- [Confidential ERC-20](https://www.zama.ai/post/confidential-erc-20-tokens-using-homomorphic-encryption)

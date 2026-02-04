---
title: "Vendor: TACEO Merces"
status: draft
maturity: testnet
---

# TACEO – Merces (Confidential Stablecoin Transfers via MPC + ZK)

## What it is

TACEO Merces is an implementation of **Private Shared State (PSS)** for confidential stablecoin transfers on EVM chains. It combines multi-party computation (MPC) with zero-knowledge proofs (Groth16 via co-SNARKs) to hide transfer amounts while maintaining on-chain verification. Currently deployed on Base and Arc testnets.

## Fits with patterns

- [co-SNARKs (Collaborative Proving)](../patterns/pattern-co-snark.md): Core proving mechanism; MPC nodes jointly generate Groth16 proofs
- [ZK Shielded Balances](../patterns/pattern-zk-shielded-balances.md): Balances stored as Pedersen commitments; amounts hidden from observers
- [Private Stablecoin Shielded Payments](../patterns/pattern-private-stablecoin-shielded-payments.md): Confidential transfer amounts (partial fit; see limitations below)

## Not a substitute for

- **Sender/receiver anonymity:** All participant addresses remain publicly visible on-chain; Merces hides amounts only
- **Stealth addresses (ERC-5564):** Recipient unlinkability requires separate stealth address infrastructure
- **Full transaction graph privacy:** Transaction existence and parties are observable; only amounts are hidden

## Architecture

Three-component system:

1. **Smart Contract:** Holds ERC-20 tokens, maintains balance commitments, queues actions, verifies Groth16 proofs
2. **MPC Network:** Three computing nodes plus orchestration server; maintains secret-shared balance maps; generates co-SNARK proofs
3. **ZK Circuit:** Noir circuits compiled to Groth16; proves balance validity, non-negativity, and correct state transitions

**Transaction flow:**
1. User initiates transfer with recipient and amount
2. Wallet encrypts amount using Diffie-Hellman key exchange (BabyJubJub curve)
3. Orchestration server distributes encrypted shares to MPC nodes
4. Nodes collaboratively compute new balances and generate Groth16 proof
5. Proof and new balance commitments posted on-chain

## Privacy domains

**Hidden:**
- Individual account balances (Pedersen commitments)
- Transfer amounts (encrypted via DH, proven in ZK)

**Public:**
- Sender and receiver addresses
- Deposit amounts (required for token transfer verification)
- Withdrawal amounts (required for payout)
- Transaction existence and ordering

## Enterprise demand and use cases

- **Confidential treasury operations:** Corporate payments where amounts are business-sensitive but counterparties are known
- **Interbank settlement:** Banks settling known bilateral positions without revealing volumes to third parties
- **Payroll and vendor payments:** Hide payment amounts from blockchain observers while maintaining compliance records

## Technical details

| Metric | Value |
|--------|-------|
| Proof system | Groth16 (via CoNoir compiler) |
| Commitment scheme | Pedersen commitments |
| Encryption | BabyJubJub elliptic curve (DH key exchange) |
| Batch size | 50 transactions per proof |
| Constraints | ~79,400 per batch |
| Gas cost | ~95k per tx; ~3.8M per batch verification |
| Throughput | ~200 TPS |
| MPC topology | 3-of-3 nodes |
| Networks | Base Testnet, Arc Testnet |

## Strengths

- **Amount confidentiality** with on-chain verification
- **ERC-20 compatible:** Works with existing stablecoin contracts
- **Batched proving:** reduces per-transaction costs
- **co-SNARK approach:** distributes trust across MPC nodes
- **Noir-based circuits:** Growing ecosystem and tooling

## Risks and open questions

- **No sender/receiver privacy:** Addresses fully visible; transaction graph analyzable
- **3-of-3 MPC assumption:** All nodes must remain honest; no threshold tolerance
- **Batch latency:** Transactions wait for batch fill (50 txs) before finalization. If a single transaction in a batch fails, the whole transaction batch fails, affecting liveness considerations.
- **Testnet only:** No mainnet deployment; production security unproven
- **Deposit/withdrawal leakage:** Entry/exit amounts public; flow analysis possible
- **Orchestration trust:** Demo setup holds plaintext balances; production requires additional encryption

## Links

- [Merces Documentation](https://merces-demo.taceo.io/base/introduction/overview)
- [TACEO co-SNARK](https://core.taceo.io/)
- [co-SNARK Paper](https://eprint.iacr.org/2021/1530.pdf)

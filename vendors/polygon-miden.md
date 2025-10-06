---
title: "Vendor/Pattern: Polygon Miden"
status: draft
maturity: PoC
---

# Polygon Miden – STARK-based VM / Privacy & Prover Infrastructure

## What it is

Polygon Miden is a zero-knowledge-focused virtual machine / blockchain stack that supports provable state transitions, private notes, and Rust-based contracts compiled to run in a STARK-friendly VM.  
It aims to scale privacy and programmability together, allowing verifiable computation in a trust-minimal, scalable way.

## Fits with patterns (names only)

- Pattern: ZK Shielded Balances for Derivatives
- Pattern: Private ISO 20022 Messaging & Settlement
- Pattern: zk-SPV (cross-chain atomicity)
- Pattern: Confidential ERC-20 (Private L2s)

## Not a substitute for

- Not a shielded-pool rail _per se_ (unless privacy note infrastructure is used for value shielding).
- Not a ready drop-in private stablecoin or ERC-20 token privacy layer (needs token/shielded note support).
- Not a full cross-chain DvP on its own (bridging + finality proofs still needed).

## Architecture

- **VM model**: STARK-based VM with a “transaction kernel” model, Rust compiler output, private notes as part of the state.
- **Prover system**: Uses STARKs & efficient hash functions tuned for their VM (see “XHash,” “Polygon Miden VM / Asset Model”).
- **Privacy features**:

  - Private notes (assets/state hidden from public view).
  - Multi-sig and custom logic supported in Rust contracts.
  - Amount hiding and account privacy depend on how notes are used.

- **Infrastructure**: Testnet live (Alpha v6); roadmap includes private note UX, multi-sig, and extended proving infra.

## Privacy domains

- **Private state changes**: private notes enable selective hidden state.
- **Programmable confidentiality**: Rust contracts + note abstraction.
- **Audit / disclosure**: potential via note keys; regulator access not yet formally defined.

## Enterprise demand and use cases

- Developers building privacy-aware smart contracts with STARK performance.
- Confidential asset flows, private transaction kernels, financial logic requiring hidden state.
- Candidate for institutional settlement rails if token models + governance are aligned.

## Technical details

- Supports private/public/encrypted note types.
- STARK-friendly primitives (e.g. XHash).
- Rust → Miden assembler compilation pipeline.
- Data availability: follows Polygon L2 DA design (Ethereum DA for rollup, alt DA for validium/volition).

## Strengths

- Strong STARK foundation: scalable, transparent setup.
- Flexible VM with Rust programmability.
- Private notes for asset/state confidentiality.
- Actively developed, testnet live with growing dev resources.

## Risks and open questions

- Token privacy not yet standardized (how ERC-20s map to notes).
- Audit/disclosure path for regulators still unclear.
- Wallet UX for note discovery/spending immature.
- Cross-chain atomicity still requires bridging (zk-SPV or similar).
- Prover costs/latency in production TBD.

## Links

- [Polygon Miden Docs](https://docs.polygon.technology/miden/)
- [Miden Book (alt docs hub)](https://0xMiden.github.io/miden-docs/)
- [Polygon Miden GitHub org](https://github.com/0xMiden)
- [miden-base (core components)](https://github.com/0xMiden/miden-base)
- [crypto (hashes & primitives)](https://github.com/0xMiden/crypto)
- [Note Types (public/private/encrypted)](https://docs.polygon.technology/learn/miden/note_types/)
- [Polygon Miden Alpha Testnet v6 blog](https://blog.polygon.technology/polygon-miden-alpha-testnet-v6-is-live/)
- [Awesome Miden (community resources)](https://github.com/phklive/awesome-miden)

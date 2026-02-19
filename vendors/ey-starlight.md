---
title: "Vendor: EY Starlight"
status: draft
---

# EY - Starlight (Solidity-to-zApp ZKP Transpiler)

## What it is

Starlight is an open-source transpiler that converts standard Solidity smart contracts into zero-knowledge applications (zApps). Developers annotate Solidity code with privacy decorators (a superset called "Zolidity"), and the compiler generates ZK circuits, on-chain verifier contracts, and JavaScript orchestration code; enabling private business logic on public Ethereum without requiring deep cryptographic expertise.

## Fits with patterns (names only)

- [Shielded ERC-20 Transfers](../patterns/pattern-shielding.md): enables building shielding-type circuits from Solidity, not a drop-in shielded pool
- [Private Shared State](../patterns/pattern-private-shared-state.md): two-party shared secret commitments via `sharedSecret` decorator
- [L1 ZK Commitment Pool](../patterns/pattern-l1-zk-commitment-pool.md): generated contracts deploy commitment pools with nullifier tracking on L1

## Not a substitute for

- **Private transaction rollups:** Starlight privatises business logic at the contract level but does not provide network-level transaction privacy or a private execution environment (see [EY Nightfall](ey-nightfall.md) or [Aztec](aztec.md))
- **Production-grade ZK infrastructure:** output zApps use Groth16 with known malleability caveats; no security audit has been completed; a trusted setup is required per circuit
- **Regulatory disclosure infrastructure:** no built-in viewing keys, selective disclosure, or compliance hooks; institutions must layer these separately (see [pattern-regulatory-disclosure-keys-proofs.md](../patterns/pattern-regulatory-disclosure-keys-proofs.md))
- **Full Solidity feature parity:** not all Solidity syntax transpiles; complex control flow, certain if-statement patterns, and loops may not be supported

## Architecture

Developers write `.zol` files (Solidity + decorators: `secret`, `known`/`unknown`, `encrypt`, `sharedSecret`, `re-initialisable`) and run `zappify`. The transpiler parses the decorated AST via `solc`, then generates:

- **ZoKrates circuits:** (`.zok`) for zero-knowledge proof generation (Groth16)
- **Solidity verifier contracts:** (`.sol`) for on-chain proof verification and commitment management

Secret state lives on-chain as cryptographic hash commitments; pre-image data stays local with the owner. Nullifiers prevent double-spending; Merkle trees provide membership proofs.

## Privacy domains

- **Single-party private state:** secret variables owned by one party; on-chain commitments hide values from all others
- **Two-party shared secrets:** `sharedSecret` decorator enables bilateral state (e.g. atomic swaps) where both parties share a derived key
- **No native selective disclosure:** Starlight does not provide viewing keys or regulator access mechanisms at the compiler level

## Enterprise demand and use cases

- **B2B contract management:** multi-party business agreements where logic must be shared but commercial terms remain confidential (procurement, supply-chain)
- **Inventory and payment management:** large-scale asset tracking with privacy from competitors, combined with Nightfall for token transfers
- **Prototyping and education:** lowest-friction path to demonstrating ZK-private business logic for organisations evaluating privacy on Ethereum
- **Target segment:** organisations migrating complex B2B agreements from private EDI systems to public Ethereum; Solidity-proficient teams wanting to explore ZK without circuit expertise

## Technical details

- **Proof system**: Groth16 (via ZoKrates); requires per-circuit trusted setup
- **Circuit language**: ZoKrates DSL (generated, not hand-written)
- **State model**: Cryptographic hash commitments; nullifiers for spend tracking; Merkle tree for membership proofs

## Strengths

- **Low barrier to entry:** Solidity developers add privacy via decorators without learning circuit DSLs; contrast with Noir/Circom which require new languages
- **End-to-end code generation:** single `zappify` command produces circuits, contracts, and orchestration; reduces manual wiring errors
- **Public domain:** no licensing constraints; enterprises can fork and customise freely

## Risks and open questions

- **No security audit:** EY explicitly warns against use for material-value transactions; the project is labelled "experimental prototype still under development"
- **Trusted setup per circuit:** each generated circuit requires a separate Groth16 trusted setup ceremony; business logic changes require new ceremonies and state migration with no documented upgrade path
- **JavaScript integer precision:** uint256 values silently lose precision if not handled with BigInt; for 18-decimal tokens this caps correct handling at ~9,007 tokens
- **Limited Solidity coverage:** not all Solidity syntax transpiles; complex conditionals, loops, and certain patterns are unsupported (see [STATUS.md](https://github.com/EYBlockchain/starlight/blob/master/doc/STATUS.md))
- **No native regulatory disclosure:** no built-in viewing keys, selective disclosure, or compliance screening hooks; institutions must build or source these separately

## Links

- [GitHub Repository](https://github.com/EYBlockchain/starlight)
- [Starlight Gitbook Documentation](https://starlight-3.gitbook.io/starlight)
- [EY Blockchain Technology Overview](https://blockchain.ey.com/technology)
- [EY Press Release: Starlight Beta (Feb 2023)](https://www.prnewswire.com/news-releases/ey-contributes-the-beta-version-of-zero-knowledge-proof-compiler-starlight-to-the-public-domain-to-enable-secure-private-business-logic-on-ethereum-301745741.html)
- [ETHGlobal Talk: Intro to Starlight](https://ethglobal.com/talks/ey-intro-to-starlight-siv8b)
- [Technical Writeup (WRITEUP.md)](https://github.com/EYBlockchain/starlight/blob/master/doc/WRITEUP.md)
- Related vendor: [EY Nightfall](ey-nightfall.md)

---
title: "Vendor: Kaleido Paladin"
status: draft
---

# Kaleido - Paladin (Programmable privacy for EVM)

## What it is
Open-source (Apache-2.0) enterprise privacy layer under the Linux Foundation Decentralized Trust. Runs as a sidecar next to an EVM client (for example Hyperledger Besu). On-chain holds masked or commitment state; cleartext is exchanged off-chain over mutual TLS or gRPC. Targets network builders (3-50 orgs) and asset holders that need private programmable workflows, PvP, and DvP with enterprise custody.

## Fits with patterns (names only)
- [L1 ZK Commitment Pool](../patterns/pattern-l1-zk-commitment-pool.md)
- [DvP ERC7573](../patterns/pattern-dvp-erc7573.md)
- [Confidential ERC20 FHE L2 ERC7573](../patterns/pattern-confidential-erc20-fhe-l2-erc7573.md)
- [Crypto Registry Bridge eWpG EAS](../patterns/pattern-crypto-registry-bridge-eWpG-eas.md)

## Not a substitute for
- Privacy L2 or App-chain
- Identity and Attestations

## Architecture
- Sidecar next to Besu; Paladin acts as a privacy-preserving transaction manager for Ethereum (no client fork).
- Secure channels between Paladin nodes for selective disclosure; data at rest remains private, data in-flight is encrypted end-to-end.
- Privacy-preserving smart contracts split across two parts:
  - Base EVM smart contract on the unmodified chain (ordering/finality, double-spend checks).
  - Off-chain Paladin runtime that manages private state, proofs/endorsements, and coordination.
- Provides similar function to legacy privacy-group managers (e.g., Tessera) with additional interoperability and atomic composition across domains.
- Base EVM ledger is the single source of truth; all domains interoperate atomically on one ledger; state stored in masked form to preserve confidentiality and anonymity.
- Transaction manager coordinates assembly, submission, and confirmation to:
  - Public EVM contracts
  - Private EVM contracts in privacy groups
  - UTXO-based private tokens
- Key management integrates with enterprise HSM/SSM; supports native Ethereum, EIP-712 endorsements, and ZKP-compatible crypto.
- Programming model includes plug points for:
  - Wallet functions (coin/state selection)
  - Endorsement coordination and signature collection
  - Sequencer selection, transaction verification, and proof generation
  - High-performance code modules in Java and WebAssembly

## Privacy domains
- Zeto (ZK UTXO tokens)
  - Circom-based ZK proofs; hides ownership/amounts/history; enforces conservation via proofs.
  - Paladin runtime includes a token indexer, UTXO selector, and proof generator.
  - Optional ERC20 bridge via deposit/withdraw; lockProof prevents proof theft in multi-leg flows (e.g., DvP).
- Noto (notarized UTXO tokens)
  - Notary/issuer governs confidential UTXO state; on-chain shows only commitments.
  - Supports basic and hooks notary modes; private and public ABIs for mint/transfer/burn and lock/unlock flows; approveTransfer and delegateLock enable delegated execution.
- Pente (private EVM execution in privacy groups)
  - Each privacy group is a unique contract that maintains its own private world state.
  - Exact transitions are pre-verified off-chain and endorsed; on-chain verification uses threshold/EIP-712 signatures with no base EVM changes.
  - Paladin runs ephemeral Besu EVMs in-process for pre-execution; private EVM can interoperate atomically with token domains.

## Enterprise demand and use cases
- Segments: network builders and asset holders needing custody/compliance.
- Common implementations: cash-like tokens plus tradeable assets; PvP; DvP; private negotiation of programmable transaction rules.
- Buyer profile: typically VP or Head of Digital Assets; privacy repeatedly cited as a key blocker for public-chain adoption.

## Technical details
- Data transports and registry
  - Two identity types:
    - Account signing identities (long-lived; may be secp256k1, BabyJubJub, ZK-related).
    - Runtime routing identities (for data-in-flight; transport certs/addresses/hosts/topics).
  - Registry plugin resolves routing identifiers to transport details; address book maps friendly names to accounts.
  - Transport principles: asynchronous message transfer, idempotent requests with retries, end-to-end encryption even via hubs/buses.
- Approval-based atomic transactions (DvP/PvP)
  - Pre-approval/setup: parties reach a private state root; prepare token transfers.
  - Approval/prepare: swap contract deployed; each domain pre-approves (privacy group endorsement, notary approval, ZK proof).
  - Execution/commit: call execute() on the swap contract; all sub-transactions commit or revert atomically.
  - Post-execution: domains remain independent; provenance is hidden except to entitled parties.

## Strengths
- Atomic composition across privacy domains without modifying EVM clients.
- Multiple privacy models under one surface (ZK UTXO, notary-backed UTXO, group-private EVM).
- Enterprise operations alignment: HSM/SSM integration, registry/addressing, predictable governance boundaries.

## Risks and open questions
- Centralization and custodial key management trade-offs in some deployments.
- Operator access to client data in certain operating modes (trust boundary).
- Scope and roadmap for interop with public DeFi and external venues.

## Links
- Architecture overview: https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/overview/
- Atomic interop (approval-based): https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/atomic_interop/
- Data transports and registry: https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/data_and_registry/
- Key management: https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/key_management/
- Programming model: https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/programming_model/
- Zeto (ZK tokens): https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/zeto/
- Noto (notarized tokens): https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/noto/
- Pente (privacy groups): https://lf-decentralized-trust-labs.github.io/paladin/head/architecture/pente/
- Repository: https://github.com/LF-Decentralized-Trust-labs/paladin
---
title: "Pattern: Noir Private Contracts"
status: ready
maturity: production
type: standard
layer: L2
last_reviewed: 2026-04-22

works-best-when:
  - Applications need composable private and public state in a single contract.
  - Developers want a privacy-focused DSL without abandoning familiar paradigms.
  - Use cases require selective privacy layers around existing DeFi protocols.
avoid-when:
  - Application requires low-latency execution; client-side proving adds overhead.
  - Team lacks capacity to adopt new tooling and non-Solidity development.
  - Simple shielding or anonymity is sufficient; lighter alternatives exist.

context: both
context_differentiation:
  i2i: "Institutions can co-deploy contracts that hide positions and trade details from competitors while exposing public logic for counterparty verification. Both parties rely on the sequencer and the validity proof pipeline for liveness; legal recourse is symmetric."
  i2u: "End users execute private functions locally and only submit proofs, so the sequencer and observers cannot see inputs, outputs, or log contents. The deployment must still guarantee forced-withdrawal paths and decentralised sequencing so users are not held hostage by an operator."

crops_profile:
  cr: medium
  o: yes
  p: full
  s: medium

crops_context:
  cr: "Medium while sequencer election is centralised. Reaches `high` once sequencing becomes permissionless."
  o: "Contracts, DSL, and prover backend are open-source. Client-side proving lets anyone run the stack locally."
  p: "Private state, private function inputs, and private logs are hidden from sequencers and observers. Public state and function calls remain transparent by design. Selective disclosure is supported through viewing keys or zero-knowledge proofs."
  s: "Rides on the soundness of the zero-knowledge proof system and the validity-proof pipeline that settles to L1. Could reach `high` by replacing admin keys with DAO-governed upgrade paths."

post_quantum:
  risk: high
  vector: "PLONK-family backends (Barretenberg) rely on EC pairings and KZG commitments, broken by CRQC. HNDL risk is high for encrypted notes."
  mitigation: "Hash-based commitments and STARK-based proving. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: [ERC-20]

related_patterns:
  composes_with: [pattern-shielding, pattern-co-snark, pattern-privacy-l2s]
  see_also: [pattern-forced-withdrawal, pattern-regulatory-disclosure-keys-proofs]

open_source_implementations:
  - url: https://github.com/AztecProtocol/aztec-packages
    description: "Aztec Network with Noir DSL, Barretenberg backend, and private execution runtime"
    language: "Noir, Rust, TypeScript"
  - url: https://github.com/noir-lang/noir
    description: "Noir language compiler and standard library"
    language: "Rust"
  - url: https://github.com/noir-lang/awesome-noir
    description: "Curated catalogue of Noir libraries and example circuits"
    language: "Noir"
---

## Intent

Give developers a privacy-focused DSL to write smart contracts that blend public logic with confidential private computation in the same contract. Private functions execute client-side and produce zero-knowledge proofs; public functions execute on the sequencer transparently. Private and public state can be composed in a single application.

## Components

- Private contract DSL: Rust-inspired language for authoring functions, compiling to a circuit intermediate representation.
- Circuit intermediate representation: backend-agnostic IR that the prover backend compiles into proving and verification keys.
- Client-side prover: generates proofs for private-function executions on the user's machine (typically 8 GB RAM recommended).
- Privacy rollup: private execution runtime, public execution VM, note-discovery infrastructure, and validity-proof pipeline to Ethereum L1.
- Encrypted logs: note discovery mechanism readable by holders of the decryption keys.

## Protocol

1. [user] Write a contract in the DSL with private and public functions. Compile to the circuit intermediate representation.
2. [user] Deploy the contract to the privacy rollup.
3. [user] Execute a private function locally, generating a zero-knowledge proof of correct execution over private inputs and state.
4. [user] Submit the proof and any public inputs to the sequencer.
5. [sequencer] Verify the proof, update the encrypted private state, and apply any public state changes.
6. [sequencer] Batch transactions periodically and settle to Ethereum L1 with a validity proof.
7. [user] Scan encrypted logs to discover incoming notes and decrypt them with local keys.

## Guarantees & threat model

Guarantees:

- Private state stays encrypted and hidden from sequencers and observers. Private function inputs and outputs are not revealed on-chain.
- Public state, public function calls, and contract source remain transparent and auditable.
- Validity proofs ensure state transitions follow contract rules; L1 finality comes via periodic batch settlement.
- Selective disclosure to auditors is possible through viewing keys or targeted zero-knowledge proofs.
- Encrypted event logs enable note discovery without leaking content to the public.

Threat model:

- Soundness of the zero-knowledge proof system and the circuit compiler.
- Non-censoring sequencer set. A censoring sequencer can stall user transactions; forced-withdrawal paths to L1 are required to bound this.
- Client-side key management: compromise of local proving or viewing keys exposes the user's private state.
- Note discovery relies on scanning; a malicious or buggy indexer can cause notes to be missed, though funds are not lost.

## Trade-offs

- Performance: client-side proving is CPU-intensive and adds latency compared to transparent L2 execution. Proof generation time depends on circuit complexity and hardware.
- Developer experience: requires learning a new DSL. Solidity contracts cannot be reused directly, and standard library coverage is still maturing.
- Ecosystem maturity: DSL and tooling are improving quickly, but primitive and library coverage is thinner than for Solidity.
- Failure modes: a bug in a private-state update path can burn notes irrecoverably because replay from encrypted logs requires the original sender's cooperation.

## Example

- A corporate treasury shields stablecoins into a private contract, receiving private notes.
- It pays a supplier privately; the client generates a zero-knowledge proof of sufficient balance and note ownership.
- The transaction emits an encrypted log that the supplier decrypts to discover the payment.
- The rollup verifies the proof, updates balances in encrypted form, and includes the transaction in a batch settled to L1. Observers see that a valid transaction occurred but not amounts or parties.
- The supplier can then spend the received notes privately; the treasury's remaining position stays hidden.

## See also

- [Aztec](../vendors/aztec.md)
- [Approach: Private Bonds](../approaches/approach-private-bonds.md)
- [Approach: Private Derivatives](../approaches/approach-private-derivatives.md)

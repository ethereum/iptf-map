---
title: "Pattern: Modular Privacy Stack"
status: draft
maturity: concept
type: meta
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - Different privacy requirements apply to different transaction phases.
  - The organization needs to swap components without redesigning the full stack.
  - Hybrid deployments span multiple environments (L1, L2, off-chain).
avoid-when:
  - Uniform end-to-end privacy is mandatory under a single vendor contract.
  - A single-domain use case has minimal privacy needs.
  - Tight latency targets rule out layer coordination overhead.

context: both
context_differentiation:
  i2i: "Between institutions the layered model lets counterparties agree on interfaces (data references, settlement proofs, disclosure artifacts) without locking the stack to one vendor per layer. Decentralized orchestration prevents any single provider from gatekeeping settlement."
  i2u: "For user-facing deployments per-layer exit paths matter: a user must be able to withdraw assets even if one layer's operator becomes unresponsive. Disclosure controls should protect the user from forced correlation across layers."

crops_profile:
  cr: medium
  o: partial
  p: partial
  s: medium

crops_context:
  cr: "Reaches `high` when routing is permissionless and each layer offers an independent exit path. Drops when orchestration concentrates in a single operator or when a settlement layer uses permissioned sequencing."
  o: "Improves to `yes` when reference implementations of each layer interface are published and orchestration logic is open source; today vendor SDKs dominate."
  p: "Layer isolation contains data leaks, but cross-layer routing reveals timing and access patterns. Reaches `full` only with end-to-end encryption between layers and metadata scrubbing at routing boundaries."
  s: "Depends on the weakest layer plus the orchestrator. Threshold cryptography for cross-layer key management and elimination of single-operator trust in orchestration raise this to `high`."

post_quantum:
  risk: medium
  vector: "PQ exposure is inherited from the chosen primitives at each layer: EC-based ZK execution layers are HNDL-exposed; TEE attestations rely on vendor signing keys; DA blobs encrypted with classical KEMs are recordable."
  mitigation: "Select PQ-resilient primitives per layer (STARK-based execution, hash-based signatures, ML-KEM for key encapsulation) and include PQ readiness in the cross-layer evaluation."

standards: [ERC-7573, ERC-3643, EIP-4844, EAS]

related_patterns:
  composes_with: [pattern-privacy-l2s, pattern-commit-and-prove, pattern-dvp-erc7573, pattern-regulatory-disclosure-keys-proofs, pattern-tee-based-privacy, pattern-l2-encrypted-offchain-audit]
  see_also: [pattern-shielding, pattern-l2-privacy-evaluation]

sub_patterns:
  - name: "Data layer"
    pattern: pattern-l2-encrypted-offchain-audit
    crops_summary: "Encrypted storage with DA anchoring; privacy depends on key management"
  - name: "Execution layer (ZK)"
    pattern: pattern-privacy-l2s
    crops_summary: "Cryptographic privacy; HNDL risk on EC-based systems"
  - name: "Execution layer (TEE)"
    pattern: pattern-tee-based-privacy
    crops_summary: "Hardware trust; mitigates prover cost but introduces vendor attestation dependency"
  - name: "Settlement layer"
    pattern: pattern-dvp-erc7573
    crops_summary: "Atomic cross-chain settlement anchored to L1 finality"
  - name: "Disclosure layer"
    pattern: pattern-regulatory-disclosure-keys-proofs
    crops_summary: "View keys, ZK proofs, and attestations for scoped audit access"
---

## Intent

Compose a privacy architecture from four distinct layers: Data, Execution, Settlement, and Disclosure. Each layer is addressed by an interchangeable technology so that institutions can select the best-fit primitive per layer, upgrade layers independently, and keep interoperability through standardized interfaces.

## Components

- **Data layer** stores and retrieves encrypted payloads. Options include off-chain encrypted storage, data-availability layers, L1 blob data, and content-addressed networks with encryption.
- **Execution layer** runs private computation. Options include zero-knowledge execution environments, fully homomorphic encryption, and trusted execution environments.
- **Settlement layer** provides finality and atomicity. Options include L1, validity-proof rollups, optimistic rollups, and cross-chain atomic swap protocols.
- **Disclosure layer** exposes scoped access for audit and compliance. Options include viewing keys, zero-knowledge proofs of properties, threshold key management, and on-chain attestations.
- **Interface contracts** define what each layer consumes and emits: encrypted reads and writes for Data, state transitions for Execution, proofs and signed transactions for Settlement, and disclosure artifacts for Disclosure.
- **Orchestration service** routes references and coordinates cross-layer flows; it aggregates audit logs across layers.

If a component is itself a pattern in this map (see `sub_patterns` and `related_patterns`), link it rather than describe it in depth.

## Protocol

1. [architect] Map each transaction phase to a layer: what data stays in Data, what runs in Execution, where finality happens, and who needs scoped access.
2. [architect] Pin the interface between each pair of layers: content-addressed references at Data, state-transition objects at Execution, proof or signed-transaction envelopes at Settlement.
3. [user] Encrypt sensitive inputs and submit them to the Data layer; receive a content-addressed reference.
4. [executor] Retrieve the reference, run the private computation, and emit a state transition or proof.
5. [contract] Verify the proof or signed transaction on the Settlement layer; commit state atomically across legs when needed.
6. [user] Emit disclosure artifacts (viewing keys, proofs of properties, attestations) for the Disclosure layer and grant scoped access to authorized parties.
7. [auditor] Reconstruct the cross-layer audit trail from data hashes, execution proofs, settlement transaction identifiers, and disclosure events.

## Guarantees & threat model

Guarantees:

- Layer isolation: a compromise or failure in one layer does not expose plaintext held by another, provided interfaces are honored.
- Upgradability: a layer can be replaced without redesigning the others, as long as the interface contract holds.
- Cross-layer audit: the combined trail is reconstructible from per-layer evidence.
- Failure containment: when Execution fails, Settlement reverts without affecting stored Data.

Threat model:

- Interface assumption: the guarantees hold only when each layer honors its interface contract. A misbehaving adapter between layers can bridge data from one to another.
- Orchestrator trust: a malicious orchestrator can correlate references and disclose timing and access patterns even when payloads stay encrypted.
- Metadata leakage: cross-layer routing discloses timing and size patterns; these are out of scope for the individual layers and must be addressed at the orchestration layer or with network-anonymity primitives.
- Key management: if disclosure keys are held by a single operator, the Disclosure layer inherits that operator's trust profile.
- Weakest-layer bound: the privacy guarantee is the minimum of what each layer provides for its part of the flow.

## Trade-offs

- Coordination complexity: the orchestration logic adds operational surface and more moving parts than a monolithic stack.
- Latency accumulation: four layers in sequence compound delays relative to an integrated solution.
- Interface rigidity: stable interfaces can constrain layer-specific optimizations and may need adapter layers over time.
- Tooling fragmentation: multiple SDKs, monitoring stacks, and support relationships follow from mixing vendors per layer.
- Metadata leakage at routing boundaries is the residual risk even when all per-layer payloads are encrypted.

## Example

A tokenized-bond issuance uses a modular stack:

- Bond terms and investor details are encrypted and stored off-chain with a content hash published to a data-availability layer.
- A zero-knowledge execution environment verifies investor eligibility and computes the allocation, emitting a settlement instruction with a validity proof.
- Atomic delivery-versus-payment settles on L1: bond tokens move to the buyer and payment tokens to the seller, or both legs revert.
- The issuer grants scoped viewing keys to the regulator through an on-chain attestation. The regulator decrypts bond terms and verifies eligibility proofs without observing the full transaction graph.

The issuer can later swap the execution environment for a different ZK system, add a regulator by issuing additional viewing keys, or move settlement to a rollup for cost reduction, without rebuilding the stack.

## See also

- [Aztec](../vendors/aztec.md)
- [Zama](../vendors/zama.md)
- [Miden](../vendors/miden.md)
- [Railgun](../vendors/railgun.md)
- [ERC-7573](https://eips.ethereum.org/EIPS/eip-7573)
- [ERC-3643](https://eips.ethereum.org/EIPS/eip-3643)
- [Ethereum Attestation Service](https://attest.sh/)

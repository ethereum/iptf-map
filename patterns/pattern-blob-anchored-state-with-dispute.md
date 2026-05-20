---
title: "Pattern: Blob-Anchored State With KZG Dispute"
status: draft
maturity: concept
layer: L1
last_reviewed: 2026-05-13

works-best-when:
  - Per-event data is high-volume and uniform but the post-batch state root must live on L1 forever
  - The application can complete its dispute window inside the EIP-4844 default 18-day blob retention
  - A bounded class of batch-level violations is checkable from a single position's opened bytes plus the on-chain state
avoid-when:
  - Per-event data must remain retrievable from L1 archive nodes after the blob retention window closes (use calldata or a separate DA layer)
  - The violation class for disputes requires opening more than a few positions per dispute (precompile gas dominates)
  - The application cannot tolerate any reorganisation between batch publication and dispute-window close

context: both
context_differentiation:
  i2i: "Consortium settlement batches publish per-trade records to a blob and post the netting root on L1; counterparties dispute by opening their own positions."
  i2u: "Permissionless event aggregation (votes, signatures, intents) where the user trusts neither the relay nor the contract to retain per-event data, and dispute is the user's residual safety."

crops_profile:
  cr: high
  o: yes
  p: partial
  s: high

crops_context:
  cr: "Blob inclusion shares the L1 censorship-resistance posture, augmented by FOCIL where deployed. Relay-selection censorship is local to a specific relay and routes around through other relays."
  o: "EIP-4844 blob carriers, the 0x0A point-evaluation precompile, and KZG opening proofs are open Ethereum protocol surfaces. UltraHonk and Plonky2 implementations are open source."
  p: "Per-event records are visible to anyone holding the blob during retention and to voluntary archivers thereafter. The on-chain footprint is the state root and a batch-versioned hash; the application's per-record proof governs what the records themselves expose."
  s: "Strong under KZG binding and the batch SNARK's soundness. Degrades when the dispute window extends past blob retention (disputants lose evidence) or when the batch SNARK admits violations that the dispute taxonomy cannot cover."

post_quantum:
  risk: high
  vector: "BLS12-381 KZG broken by CRQC; the dispute path's binding property fails. SNARK over BN254 KZG is similarly exposed. HNDL risk applies to retained blob commitments."
  mitigation: "Post-quantum DA layer with hash-based commitments. Migration requires changing both the blob carrier and the in-circuit batch-equivalence constraint."

standards: [EIP-4844, EIP-7805]

related_patterns:
  composes_with: [pattern-shielding, pattern-private-mtp-auth, pattern-co-snark, pattern-forced-withdrawal, pattern-focil-eip7805]
  alternative_to: [pattern-l2-encrypted-offchain-audit, pattern-private-shared-state-cosnark]
  see_also: [pattern-zk-proof-systems, pattern-modular-privacy-stack]

open_source_implementations:
  - url: https://eips.ethereum.org/EIPS/eip-4844
    description: "EIP-4844 Shard Blob Transactions, including the 0x0A point-evaluation precompile"
    language: spec
  - url: https://github.com/AztecProtocol/barretenberg
    description: "UltraHonk over BN254 with KZG, used in reference deployments for the in-circuit cross-field decomposition that binds in-circuit scalars to blob field elements"
    language: C++/Rust
---

## Intent

Some applications batch per-event records (votes, signatures, trade tickets, intents) where the records need cheap Data Availability but the resulting state needs a fixed-size L1 anchor. EIP-4844 blobs supply the Data Availability inside the ~18-day default retention window without persisting on L1; the L1 footprint reduces to the post-batch state-transition root and a `batch_versioned_hash`. Any party holding the blob can challenge a specific position through the 0x0A point-evaluation precompile, inside a bounded dispute window. Consensus-layer nodes broadcast the records and voluntary archivers retain them; the contract sees no per-event content.

The dispute path catches blob-level invariants that the batch SNARK does not itself enforce (out-of-domain field values, intra-batch duplicates against an application-required uniqueness rule, or ordering violations under a canonical sort), by opening one or two positions through the precompile and applying a Registry-side violation predicate to the opened bytes.

## Components

- **Per-record encoding**: each event record is packed into a fixed number of BLS12-381 field elements with a canonical byte-to-field rule. The reference encoding uses four 31-byte slots per record (high byte of each 32-byte field element zeroed to keep encoded values below `BLS_MODULUS`); the application allocates the 124 raw bytes between content and reserved padding.
- **Batch transition SNARK**: proves the on-chain state-root transition from `prior_root` to `new_root` is consistent with the batch's records under canonical ordering, including (a) recursive verification of each record's per-record proof and any application-required predicate, (b) in-batch pairwise uniqueness on any application-required tags, and (c) cross-field decomposition binding each in-circuit BN254 scalar to its BLS12-381 representation on the blob.
- **Registry contract**: holds `prior_root`, `new_root`, `batch_versioned_hash`, `batch_index`, `leaf_count`, and a `BatchRecord.state` of `Active | Repudiated`. Validates the batch SNARK and the storage-equality assertions on submission.
- **Dispute taxonomy**: a closed list of violation types, each naming (i) the field-element indices the disputant must open, (ii) the predicate the Registry applies to the opened bytes, and (iii) any cross-position evidence (e.g., a second position `j` for intra-batch-duplicate disputes).
- **0x0A point-evaluation precompile**: validates that the polynomial committed by `batch_versioned_hash` evaluates to a caller-supplied field element `y` at index `z`. Input is `versioned_hash || z || y || commitment || proof` (192 bytes); on success the precompile returns the constants `FIELD_ELEMENTS_PER_BLOB || BLS_MODULUS` (64 bytes), so the disputant must supply `y` and the Registry decodes those bytes under the encoding rule.

## Protocol

1. [relay] Collect per-event records targeting the same application context (settlement window, intent epoch).
2. [relay] Order the records under the application's canonical rule, serialise into a single blob, and compute `batch_versioned_hash`.
3. [relay] Build the batch transition SNARK binding `prior_root`, `new_root`, the blob commitment, and the application's bindings.
4. [relay] Submit the blob and SNARK; the Registry verifies the SNARK, asserts equality on every binding input, advances roots, and records `BatchRecord.state = Active`.
5. [disputant] Inside the dispute window, submit the violation type, the disputed-position openings, and any cross-position openings via the Registry.
6. [contract] Validate the openings through the 0x0A point-evaluation precompile and apply the violation predicate. If the predicate holds, set `BatchRecord.state = Repudiated`, roll back to the preceding active batch's roots, and emit a repudiation event; otherwise revert.

## Guarantees & threat model

- **DA-bounded validity**: the batch SNARK proves the state transition from a single binding `prior_root` to `new_root`. The in-circuit cross-field decomposition gadget pins each in-circuit scalar to its BLS12-381 representation on the blob, so a relay's state advance must match the canonical encoding.
- **Position-level disputability**: any party holding the blob during the retention window can prove a single position's bytes to the Registry via 0x0A. The dispute taxonomy bounds the cost of a single dispute to a constant number of openings plus the violation-predicate gas.
- **Rollback minimality**: a successful dispute rolls back the repudiated batch and any later batches that built on it (forcing the relay to rebuild against the post-rollback state); prior active batches retain their contributions.
- **Threat model**: a blob inconsistent with the SNARK on submission. A SNARK-valid batch with a blob-level violation is repudiated during the dispute window, and relay-level censorship of disputes has no effect because disputes execute through the Registry directly. Out of scope: an adversary who suppresses blob propagation past consensus-layer broadcast; loss of blob availability after retention (the application's dispute window must close inside the retention window).

## Trade-offs

- **Dispute window vs. retention**. EIP-4844 default retention is 4096 epochs (about 18 days). The application sizes its participation or batching window so that the dispute window for every batch closes inside that retention; long windows force voluntary archiver dependency.
- **Encoding fragility**. The byte-to-field encoding rule, the canonical ordering, and the in-circuit decomposition gadget must produce identical byte sequences in either field. Cross-field circuits have shipped soundness bugs from exactly this mismatch; auditors must verify the alignment.
- **Dispute taxonomy completeness**. Violations not in the closed taxonomy are unprovable via the dispute path and must be caught structurally inside the batch SNARK. Splitting constraints between the SNARK and the dispute predicates trades SNARK proving time against precompile gas and disputant burden of proof.
- **Concurrent batches**. At most one batch advances the root from a given `prior_root`. Late-arriving competing batches fail the equality check; their relays must rebuild against the updated state.
- **Reorg sensitivity**. A batch transaction evicted by an L1 reorganisation before finality is dropped; downstream participants retain their pre-finality state and must resubmit. FOCIL where deployed ([EIP-7805](https://eips.ethereum.org/EIPS/eip-7805)) reduces coordinated-builder censorship.

## Example

An inter-bank netting consortium aggregates up to 1000 daily trade records (counterparties, pair, notional, settlement leg) into a blob and posts the netting root plus `batch_versioned_hash` on L1; the batch SNARK proves the netting under the canonical rule. A counterparty spotting a trade with an unauthorised pair opens the four BLS12-381 field elements via 0x0A and submits the `y_i` bytes plus the violation type to the Registry. The Registry validates each opening, confirms the pair is not in the authorised set, marks the batch repudiated, and rolls back the netting root. The next cycle rebuilds against the rolled-back state without needing the disputed blob to remain available.

## See also

- [EIP-4844: Shard Blob Transactions](https://eips.ethereum.org/EIPS/eip-4844).
- [EIP-7805: Fork-Choice enforced Inclusion Lists](https://eips.ethereum.org/EIPS/eip-7805).

---
title: "Pattern: Private Information Retrieval"
status: ready
maturity: research
type: standard
layer: offchain
last_reviewed: 2026-06-18

works-best-when:
  - The index of a lookup is itself sensitive (e.g., which note, which order book entry, which directory record).
  - The queried database is operated by a counterparty, a shared indexer, or any party that should not learn intent.
  - An integrity anchor exists alongside the database (on-chain state root, signed snapshot) so responses can be verified.
avoid-when:
  - The client already replicates the database locally; running an own indexer closes the leak without PIR.
  - Network-layer metadata (timing, IP) is the dominant exposure; address that first with [pattern-network-anonymity](pattern-network-anonymity.md).

context: both
context_differentiation:
  i2i: "An institution uses PIR to query a counterparty- or third-party-held database (market data, order books, RFQ venues, regulatory directories) without revealing which records it cares about. For replicable public data such as Ethereum state, the institution can also sidestep PIR by hosting its own indexer; PIR is then defence-in-depth rather than the primary mitigation."
  i2u: "End users depend on third-party RPC and indexers and cannot replicate large databases locally. PIR is the load-bearing mitigation whenever a lookup index would leak intent (the specific note about to be spent, the directory entry being scanned)."

crops_profile:
  cr: medium
  o: yes
  p: full
  s: high

crops_context:
  cr: "Independent of any single operator when paired with multi-server schemes or with a client that chooses its server. Drops to `low` when a single operator holds the only copy of the database and clients have no alternative."
  o: "Multiple open-source implementations (SimplePIR, FrodoPIR, Respire, InsPIRe) with permissive licences. The pattern is a primitive, not a deployment, so openness depends on the application that wraps it."
  p: "Server learns that a query was issued, and (for batched schemes) the rate of queries; it does not learn which record was retrieved. Network-layer metadata is out of scope and must be covered separately."
  s: "Modern schemes reduce to LWE or RLWE. Result authenticity is not provided by PIR alone and must be anchored separately."

post_quantum:
  risk: low
  vector: "Classical DDH-based PIR schemes are broken by a CRQC; HNDL risk on any encrypted query payloads built from EC primitives."
  mitigation: "Use lattice-based PIR (SimplePIR, DoublePIR, FrodoPIR, Respire, InsPIRe). See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  composes_with: [pattern-shielding, pattern-stealth-addresses]
  see_also: [pattern-network-anonymity, pattern-user-controlled-viewing-keys]

open_source_implementations:
  - url: https://github.com/ahenzinger/simplepir
    description: "SimplePIR / DoublePIR reference implementation (USENIX Security 2023)"
    language: "Go"
  - url: https://github.com/itzmeanjan/frodoPIR
    description: "FrodoPIR port (PoPETs 2023)"
    language: "C++"
  - url: https://github.com/AMACB/respire
    description: "Respire (Burton, Menon, Wu, CCS 2024)"
    language: "Rust"
  - url: https://github.com/brech1/tree-pir
    description: "tree-pir, PSE benchmarking of Respire against LeanIMTs for shielded-pool retrieval"
    language: "Rust"
  - url: https://github.com/google/private-membership/tree/main/research/InsPIRe
    description: "InsPIRe, Google research single-server PIR"
    language: "C++"
---

## Intent

Let a client retrieve record `i` from a server-held database without revealing `i` to the server. PIR is a generic primitive: it applies wherever the index of a lookup is itself sensitive. Concrete cases in this map include fetching a Merkle inclusion path or an incoming note from a shielded-pool indexer, querying a market-data or order-book service for a specific instrument, and looking up a regulatory-directory entry whose identity would otherwise leak intent.

## Components

- Client query encoder, which produces an encrypted query for index `i` under a lattice scheme.
- Server, which evaluates the query against the full database. Single-server schemes carry the entire compute cost; multi-server schemes split it across non-colluding parties.
- Database snapshot or stream, indexed in a form the scheme expects (flat array, tree, sharded layout).
- Integrity anchor appropriate to the database: an on-chain state root and light client for replicated chain data, a signed snapshot or transparency log for off-chain data.
- Client-side application keys that govern which queries get issued (for example, the viewing key used to identify the leaf whose path is being retrieved).

## Protocol

1. [server] Publish or snapshot the indexed database; commit to it via the integrity anchor.
2. [user] Identify the target index `i` from local state (note identifier, instrument identifier, directory key).
3. [user] Encrypt a PIR query for `i` under the scheme's public parameters and send it to the server.
4. [server] Compute the response over the entire database without learning `i`, and return it.
5. [user] Decrypt the response to recover the record.
6. [user] Verify the record against the integrity anchor (Merkle proof against the on-chain root, signature on the snapshot) before acting on it.

## Guarantees & threat model

Guarantees:

- The server learns that a query was issued, the time, and aggregate query rate, but not which record was retrieved.
- Privacy reduces to a standard lattice assumption (LWE or RLWE) for modern schemes.
- Composes with any integrity layer that can attest to the database contents.

Threat model:

- Hardness of the underlying lattice problem.
- Correctness of the integrity anchor. PIR alone does not authenticate the response; a malicious or buggy server can return arbitrary records unless verification is performed against the anchor.
- Non-collusion between servers in multi-server schemes.
- Network-layer metadata (IP, timing, query rate) is out of scope and requires [pattern-network-anonymity](pattern-network-anonymity.md).

## Trade-offs

- Server compute scales (sub)linearly with database size per query. PSE benchmarks of Respire against tree-shaped state on `r7i.8xlarge` report seconds at 2²¹ records and minutes at 2²⁵, before any application-level batching or sharding.
- Single-server schemes concentrate cost on one operator and require trust that the operator runs the scheme honestly; multi-server schemes split cost but add a non-collusion assumption.
- Client bandwidth and compute are modest with modern schemes (hundreds of bytes per query, milliseconds of work) and rarely the binding constraint.
- PIR alone does not authenticate responses; designs must pair it with an integrity anchor.
- Applicability sidestep: when the database is publicly replicable, an operator can host its own copy and skip PIR. For counterparty-held or external databases the sidestep does not apply; PIR remains the cryptographic option.
- Adjacent primitives cover scenarios where the client does not know the index. Oblivious Message Retrieval (OMR) handles private message detection on a bulletin board; Fuzzy Message Detection (FMD) gives a probabilistic, cheaper variant. They are not interchangeable with PIR but solve a neighbouring problem.

## Example

- Recipient of a shielded note: the wallet fetches Merkle siblings for the recipient's leaf via PIR against the pool indexer. The indexer learns that a query happened but not which leaf. The wallet verifies the path against the on-chain pool root before constructing the spend proof.
- Institutional market-data query: a desk fetches a quote or order-book level for a specific instrument from a shared venue without revealing which instrument it cares about, preventing the venue (or anyone able to read its query log) from inferring trading intent.

## See also

- [Project Tachyon (Zcash), PIR-native shielded pool](https://tachyon.z.cash/)
- [PSE write-up on Ethereum Privacy with PIR](https://pse.dev/blog/ethereum-privacy-pir)
- [SimplePIR / DoublePIR (Henzinger et al., USENIX Security 2023)](https://eprint.iacr.org/2022/949)
- [FrodoPIR (Davidson et al., PoPETs 2023)](https://eprint.iacr.org/2022/981)
- [Respire (Burton, Menon, Wu, CCS 2024)](https://eprint.iacr.org/2024/1165)
- [Sharded PIR design for the Ethereum state](https://ethresear.ch/t/sharded-pir-design-for-the-ethereum-state/24552)

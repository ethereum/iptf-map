---
title: "Pattern: zk-promises (stateful anonymous credentials)"
status: draft
maturity: research
type: standard
layer: hybrid
last_reviewed: 2026-04-22

works-best-when:
  - A service must enforce compliance, moderation, or rate-limit rules on anonymous users without identifying them.
  - Violations are detected asynchronously, after the user's session ends.
  - Users need programmable, mutable private state (reputation, compliance flags, access control) that survives across sessions.
avoid-when:
  - Real-time compliance decisions require plaintext access to user data.
  - Users cannot reliably store or back up local state; zk-object contents are client-side.
  - Append-only bulletin-board availability cannot be guaranteed.

context: both
context_differentiation:
  i2i: "Between institutions each party can hold its own zk-object representing the counterparty relationship (exposure, limits, compliance signals). Callbacks are posted by named counterparties, and privacy is focused on third-party observers rather than each other. Bulletin-board availability is typically covered by bilateral SLAs."
  i2u: "For end users the provider must be unable to correlate updates with specific users. Obliviousness is what prevents selective targeting of a known individual; the user's ability to prove ingestion of recent callbacks is what keeps the provider honest. Loss of local state by the user means loss of reputation, so recovery paths (encrypted backup, hardware keys) become part of the deployment."

crops_profile:
  cr: medium
  o: partial
  p: full
  s: medium

crops_context:
  cr: "The provider can refuse service to users who fail predicate checks, but cannot selectively target a known user. CR drops to `low` when the provider controls the sole bulletin board and no alternative exists."
  o: "The published construction and reference circuits are open. Production deployments may use proprietary predicates or bulletin-board infrastructure."
  p: "The provider learns only the boolean result of each predicate check. Actions by the same user are unlinkable across sessions within the callback-expiry window."
  s: "Rides on zk-SNARK soundness, correctness of the predicate circuits, and the bulletin board's append-only property. A compromised or forking bulletin board could feed different views to different clients."

post_quantum:
  risk: high
  vector: "zk-SNARK constructions based on elliptic-curve pairings are broken by a CRQC. Pubkey-rerandomizable signature schemes in common use today (EdDSA, ECDSA) are similarly broken. HNDL risk applies to any long-lived commitment chain on the bulletin board."
  mitigation: "STARK-based instantiation with hash-based commitments. Post-quantum rerandomizable signatures are a research frontier. See [Post-Quantum Threats](../domains/post-quantum.md)."

standards: []

related_patterns:
  composes_with: [pattern-shielding, pattern-voprf-nullifiers, pattern-commit-and-prove, pattern-compliance-monitoring]
  see_also: [pattern-regulatory-disclosure-keys-proofs, pattern-proof-of-innocence]

open_source_implementations:
  - url: https://eprint.iacr.org/2024/1260
    description: "zk-promises paper with protocol specification and reference construction (research)"
    language: "N/A"
---

## Intent

Let a service enforce mutable compliance, moderation, or rate-limit rules on anonymous users without identifying them. The user holds a zk-object with private mutable state (reputation, compliance flags, ban status) as a commitment on an append-only bulletin board. The provider posts asynchronous callbacks that update the state without knowing which user is affected. On each interaction the user proves predicates over the current state via a zero-knowledge proof.

## Components

- Zk-object commitment stored on the bulletin board; the owner holds the plaintext state locally.
- Append-only bulletin board (on-chain contract or off-chain log with integrity anchoring) records commitments, nullifiers, and encrypted callback tickets.
- Predicate circuits let the user prove predicates over state (reputation above threshold, not banned, callbacks ingested) without revealing the state itself.
- Pubkey-rerandomizable signatures give each interaction a fresh public key so that actions by the same user are unlinkable.
- Callback ticket is a pseudorandom handle produced during interaction; the provider can later post an encrypted update against it.
- Client-side prover generates proofs at interaction time and rebuilds state when ingesting callbacks.

## Protocol

1. [user] Create a zk-object with initial private state and submit the initial commitment to the bulletin board.
2. [user] At interaction time, generate a zero-knowledge proof that the current state satisfies the provider's predicates and hand it to the provider along with fresh callback tickets.
3. [contract] The bulletin board validates the proof, consumes the old nullifier, and accepts the new commitment.
4. [operator] The provider later posts a callback to the bulletin board by attaching encrypted method arguments to one of the tickets (for example, a reputation decrement or a ban).
5. [user] Periodically scan the bulletin board for their tickets, ingest any new callbacks, apply the methods to local state, and post the updated commitment.
6. [user] At the next interaction, prove that all callbacks up to a recent cutoff have been ingested, so the provider knows the user is current.

## Guarantees & threat model

Guarantees:

- Confidentiality: object contents are visible only to the owner.
- Obliviousness: a state update does not reveal which object was updated; actions by the same user are unlinkable.
- Integrity: state transitions follow the programmed methods; callbacks cannot be skipped if the provider checks the scan cutoff.
- Atomicity: the old nullifier is consumed on each transition, preventing forks or double-spend of a state version.

Threat model:

- Soundness of the proof system and correctness of the predicate circuits.
- Append-only integrity of the bulletin board. A forking or equivocating board can feed different views to different clients.
- Client state custody. A user who loses their local plaintext cannot recover the zk-object; server-side recovery is out of scope by design.
- Metadata at the network layer (timing of scans, provider interactions, IP) is out of scope for this pattern.

## Trade-offs

- Clients must scan the bulletin board and process callbacks; scanning cost grows with board size and requires incremental indexing.
- A temporary linkability window exists while a callback ticket is active; after expiry no identifying information remains.
- Per-interaction proof generation cost is non-trivial; published benchmarks are under one second client-side, but predicate complexity drives the number up quickly.
- Recovery story for lost client state is weak. Deployments typically pair the pattern with encrypted cloud backups or hardware-keyed derivation.

## Example

An institutional stablecoin platform allows anonymous transfers under compliance policy. Each user holds a zk-object with compliance state (KYC-valid flag, AML reputation score). At transfer time the user proves that the KYC flag is valid, that reputation is above a threshold, and that all callbacks within the last 24 hours have been ingested. If a later AML review flags a transaction, the compliance team posts a callback that docks the user's reputation. The user ingests the callback before the next transfer. The platform never learns which user was flagged; it checks only that the user's updated state still passes the predicates.

## See also

- [zk-promises paper (ePrint 2024/1260)](https://eprint.iacr.org/2024/1260)
- [USENIX Security 2025 presentation](https://www.usenix.org/conference/usenixsecurity25/presentation/shih)
- [ZK Podcast: Stateful ZK Identity with Ian Miers](https://zeroknowledge.fm/podcast/389/)

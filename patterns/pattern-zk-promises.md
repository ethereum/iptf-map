---
title: "Pattern: zk-promises (Stateful Anonymous Credentials)"
status: draft
maturity: PoC
layer: hybrid
privacy_goal: Allow a service provider to enforce rules on anonymous users via async callbacks without identifying them or seeing their state
assumptions: zk-SNARKs, append-only bulletin board (on-chain or off-chain), pubkey-rerandomizable signatures
last_reviewed: 2026-04-08
works-best-when:
  - Service provider must enforce compliance rules (flag, restrict, ban) on anonymous users
  - Violations are detected asynchronously, after the user's session ends
  - Users need programmable, mutable private state (reputation, credentials, access control)
avoid-when:
  - Real-time compliance decisions require plaintext access to user data
  - Users cannot store or back up local state (zk-object is client-side)
  - Bulletin board availability cannot be guaranteed
dependencies:
  - zk-SNARKs
  - Pubkey-rerandomizable signatures (EdDSA or ECDSA)
  - Append-only bulletin board
context: both
crops_profile:
  cr: medium
  os: partial
  privacy: full
  security: medium
---

## Intent

Enable a service provider to moderate, rate-limit, or enforce compliance rules on anonymous users without identifying them or seeing their private state. The user holds a "zk-object" containing mutable state (reputation scores, compliance flags, ban status) as commitments. The provider posts asynchronous callbacks to update that state (e.g., dock reputation, issue a ban) without knowing which user is affected. On each interaction, the user proves predicates on their current state via ZK.

Introduced in [Shih et al. (2024)](https://eprint.iacr.org/2024/1260). Published at [USENIX Security 2025](https://www.usenix.org/conference/usenixsecurity25/presentation/shih).

## Ingredients

- **Cryptography**: zk-SNARKs for predicate proofs and state-transition verification; pubkey-rerandomizable signatures (EdDSA/ECDSA) for unlinkable authentication; Merkle trees for bulletin board membership proofs; commitments + nullifiers for state integrity and replay prevention
- **Infrastructure**: append-only bulletin board (can be an on-chain contract or an off-chain log with integrity anchoring); client-side prover
- **State model**: zk-object stored as a commitment on the bulletin board; each state transition appends a fresh commitment and reveals the old nullifier

## Protocol

1. User creates a zk-object with initial private state (e.g., reputation = 0, not banned). The bulletin board stores the commitment; user holds the plaintext locally.
2. On interaction, user generates a zero-knowledge proof that their state satisfies the provider's predicates (e.g., "reputation above threshold AND not banned AND scanned callbacks within 24h"). Provider verifies the proof, learns nothing beyond pass/fail.
3. The interaction generates pseudorandom callback tickets. These are opaque handles the provider can later use to post feedback.
4. Provider (or a moderator) posts a callback to the bulletin board by placing a ticket with encrypted method arguments (e.g., `updateRep(moderator, -3)` or `ban()`). The callback is public but encrypted; the provider does not know which user it targets.
5. User periodically scans the bulletin board for their tickets. When a callback is found, the user ingests it: executes the method on their local state and produces a new commitment.
6. The next interaction requires proof that all recent callbacks have been ingested. The `lastFullScanTime` must be recent enough (e.g., within 24 hours of the provider's cutoff).

## Guarantees

- **Confidentiality**: object contents visible to the owner and no other party. The provider sees proofs and commitments, never plaintext state.
- **Obliviousness**: an object update does not reveal which object was updated. Actions by the same user cannot be linked to each other.
- **Integrity**: state can be updated exclusively via the programmed methods. Users cannot skip callbacks or forge state transitions.
- **Atomicity**: one valid version of each object at a time; no forking or double-spend. The old nullifier is consumed on each transition.

## Trade-offs

- Client must poll the bulletin board and process callbacks. If the board grows large, scanning cost increases (the paper uses incremental scanning to bound per-interaction work).
- Callback expiry creates a temporary linkability window: the user stores a ticket-to-action mapping locally until callbacks expire. After expiry, no identifying information remains.
- Proof generation cost per interaction (benchmarked at <1s client-side, <4ms server verification in the paper's reputation system).
- Client state is local. Lost device = lost state unless backed up. No server-side recovery by design.
- **CROPS context (both)**: CR is `medium` because the provider can refuse service to users who fail predicate checks, but cannot selectively target users (obliviousness). In I2U, CR drops if the provider controls the sole bulletin board and no alternative exists. Privacy is `full`: the provider learns nothing beyond the boolean predicate result; user actions are unlinkable. OS is `partial`: the paper's construction is public, but production deployments may use proprietary circuits or bulletin board infrastructure. Security is `medium`: relies on zk-SNARK soundness and the bulletin board's append-only property; compromised board could feed different views to different clients.
- **Post-quantum exposure**: zk-SNARK constructions using EC-based pairings (Groth16) are broken by CRQC. Mitigation: STARK-based instantiation with hash-based commitments. See [Post-Quantum Threats](../domains/post-quantum.md).

## Example

An institutional stablecoin platform allows anonymous transfers. Users hold zk-objects with compliance state (KYC-valid flag, AML reputation score). On each transfer, the user proves: "KYC flag = valid AND reputation > threshold AND scanned within 24h." If a post-hoc AML review flags a transaction, the compliance team posts a callback docking the user's reputation. The user ingests the callback before the next transfer. The platform never learns which user was flagged; it verifies solely that the user's updated state still passes the predicates.

## See also

- [Shielded ERC-20 Transfers](pattern-shielding.md): hides balances and metadata from the public chain; zk-promises extends this to hiding state from the operator
- [VOPRF Nullifiers](pattern-voprf-nullifiers.md): related nullifier-based unlinkability primitive
- [Commit and Prove](pattern-commit-and-prove.md): commitment schemes used in zk-object state transitions

## See also (external)

- [zk-promises paper (ePrint 2024/1260)](https://eprint.iacr.org/2024/1260)
- [USENIX Security 2025 presentation](https://www.usenix.org/conference/usenixsecurity25/presentation/shih)
- [ZK Podcast: Stateful ZK Identity with Ian Miers](https://zeroknowledge.fm/podcast/389/)
